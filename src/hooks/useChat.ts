import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, EIP712Data } from '../types/chat';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const roomId = useRef(uuidv4());
  
  const signerRef = useRef(signer);
  useEffect(() => {
    signerRef.current = signer;
  }, [signer]);

  // 에러 메시지를 채팅창에 표시하는 함수
  const showErrorMessage = (title: string, message: string, emoji: string = '❌') => {
    const errorMessage: ChatMessage = {
      id: uuidv4(),
      senderName: 'System',
      text: `${emoji} **${title}**\n\n${message}`,
      isUser: false
    };
    
    setMessages(prev => [...prev, errorMessage]);
  };

  // 서명 처리 함수
  const handleSignMessage = async (dataToSign: EIP712Data) => {
    console.log('[handleSignMessage] 서명 요청:', dataToSign);
    
    if (!signerRef.current) {
      console.log('[handleSignMessage] Wallet not connected');
      showErrorMessage(
        'Wallet Not Connected',
        'Please connect your wallet first to sign transactions.\n\n🔗 Click the "Connect Wallet" button to get started.',
        '🔒'
      );
      await connectWallet();
      return;
    }

    try {
      // 현재 네트워크 확인
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const network = await provider.getNetwork();
      const requiredChainId = BigInt(dataToSign.domain.chainId || 84532);
      
      console.log('[handleSignMessage] 현재 네트워크:', network.chainId);
      console.log('[handleSignMessage] 필요한 네트워크:', requiredChainId);
      
      if (network.chainId !== requiredChainId) {
        console.log('[handleSignMessage] 네트워크 불일치, 전환 요청');
        
        // 네트워크 불일치 안내 메시지
        showErrorMessage(
          'Wrong Network Detected',
          `🔗 **Current Network:** ${network.name || 'Unknown'} (Chain ID: ${network.chainId})\n🎯 **Required Network:** Base Sepolia (Chain ID: 84532)\n\n⚡ **Action Required:**\n1. Open MetaMask\n2. Switch to Base Sepolia network\n3. Try your transaction again\n\n💡 We'll attempt to switch automatically...`,
          '🌐'
        );
        
        const switchSuccess = await switchToBaseNetwork();
        if (!switchSuccess) {
          showErrorMessage(
            'Network Switch Failed',
            '❌ **Failed to switch to Base Sepolia network.**\n\n🔧 **Manual Steps:**\n1. Open MetaMask\n2. Click network dropdown\n3. Select "Base Sepolia"\n4. If not available, add it manually:\n   - Network Name: Base Sepolia\n   - RPC URL: https://sepolia.base.org\n   - Chain ID: 84532\n   - Symbol: ETH',
            '⚠️'
          );
          return;
        }
        
        // 네트워크 전환 성공
        showErrorMessage(
          'Network Switched Successfully',
          '✅ **Successfully switched to Base Sepolia network!**\n\n🎯 You can now proceed with your transaction.',
          '🎉'
        );
        
        // 네트워크 전환 후 새로운 signer 생성
        const newProvider = new ethers.BrowserProvider(window.ethereum!);
        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);
        signerRef.current = newSigner;
      }

      const { domain, types, value } = dataToSign;
      
      console.log('[handleSignMessage] 원본 서명 데이터:', { domain, types, value });
      
      // BigInt 타입 변환
      const compatibleDomain = {
        ...domain,
        chainId: BigInt(domain.chainId || 0)
      };
      
      const compatibleValue = {
        ...value,
        amount: BigInt(value.amount || 0),
        nonce: BigInt(value.nonce || 0),
        deadline: BigInt(value.deadline || 0)
      };
      
      console.log('[handleSignMessage] 메타마스크 서명 요청:', { 
        compatibleDomain, 
        types, 
        compatibleValue 
      });
      
      const signature = await signerRef.current.signTypedData(
        compatibleDomain, 
        types, 
        compatibleValue
      );
      
      console.log('[handleSignMessage] 서명 성공:', signature);
      
      // 서명을 백엔드로 전송 (원본 서명 데이터도 함께 전송)
      if (!socketRef.current?.connected) {
        console.log('[handleSignMessage] 소켓이 연결되지 않음');
        showErrorMessage(
          'Connection Error',
          '📡 **Server connection lost.**\n\n🔄 **Please try:**\n1. Refresh the page\n2. Check your internet connection\n3. Try again in a moment',
          '📡'
        );
        return;
      }

      const signatureMessageData = {
        text: signature,
        roomId: roomId.current,
        userId: walletAddress,
        signature: signature,
        signatureData: {
          domain: domain,
          types: types,
          value: value,
          amount: value.amount,
          nonce: value.nonce,
          deadline: value.deadline
        }
      };

      console.log('[handleSignMessage] 서명 데이터 전송:', signatureMessageData);
      socketRef.current.emit('message', signatureMessageData);
      
    } catch (error: any) {
      console.error('[handleSignMessage] Signature failed:', error);
      
      // 사용자가 서명을 거부한 경우
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        showErrorMessage(
          'Transaction Cancelled',
          '✋ **You cancelled the transaction.**\n\n💡 **To proceed:**\n- Try the command again\n- Approve the transaction in MetaMask when prompted',
          '🚫'
        );
      } else {
        // 기타 서명 오류
        showErrorMessage(
          'Signature Failed',
          `❌ **Transaction signature failed.**\n\n🔍 **Error Details:**\n${error.message || 'Unknown error occurred'}\n\n🔄 **Please try:**\n1. Check your wallet connection\n2. Ensure sufficient gas fees\n3. Try the transaction again`,
          '⚠️'
        );
      }
    }
  };

  // 메시지에서 서명 요청 감지
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isUser === false && 
        lastMessage.action === 'AWAITING_SIGNATURE' && 
        lastMessage.dataToSign) {
      console.log('[useEffect] 서명 요청 감지, 서명 처리 시작');
      setTimeout(() => handleSignMessage(lastMessage.dataToSign!), 500);
    }
  }, [messages]);

  // 네트워크 전환 함수
  const switchToBaseNetwork = async () => {
    if (typeof window.ethereum === 'undefined') return false;

    try {
      // Base Sepolia 네트워크로 전환 요청
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      });
      return true;
    } catch (switchError: any) {
      // 네트워크가 추가되지 않은 경우 추가 요청
      if (switchError.code === 4902) {
        try {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('[switchToBaseNetwork] 네트워크 추가 실패:', addError);
          return false;
        }
      }
      console.error('[switchToBaseNetwork] 네트워크 전환 실패:', switchError);
      return false;
    }
  };

  // 지갑 연결
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      console.log('[connectWallet] MetaMask not installed');
      showErrorMessage(
        'MetaMask Not Found',
        '🦊 **MetaMask is not installed.**\n\n📥 **To get started:**\n1. Visit metamask.io\n2. Install MetaMask extension\n3. Create or import a wallet\n4. Return here to connect\n\n💡 MetaMask is required for blockchain transactions.',
        '🦊'
      );
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await provider.getSigner();
      const address = await signerInstance.getAddress();
      
      // 현재 네트워크 확인
      const network = await provider.getNetwork();
      console.log('[connectWallet] 현재 네트워크:', network.chainId);
      
      setSigner(signerInstance);
      setWalletAddress(address);
      
      console.log(`[connectWallet] Wallet connected successfully: ${address}`);
      
      // 네트워크 확인 메시지
      let networkMessage = '';
      if (network.chainId !== 84532n) {
        networkMessage = '\n⚠️ Please switch to Base Sepolia network.';
      } else {
        networkMessage = '\n✅ Connected to Base Sepolia network';
      }
      
      // 지갑 연결 성공 메시지 추가
      const successMessage: ChatMessage = {
        id: uuidv4(),
        senderName: 'System',
        text: `✅ **Wallet Connected Successfully!**

📍 **Address:** ${address.substring(0, 6)}...${address.substring(38)}${networkMessage}

🎯 **Next Steps:**
1. Check your current collateral: \`status\`
2. Deposit collateral: \`deposit 0.1 eth\`
3. Borrow KK tokens: \`borrow 10 kkcoin\`

💡 **Need help?** Just ask me anything about lending, deposits, or quests!`,
        isUser: false
      };
      
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error: any) {
      console.error('[connectWallet] Wallet connection failed:', error);
      
      // 사용자가 연결을 거부한 경우
      if (error.code === 4001) {
        showErrorMessage(
          'Wallet Connection Cancelled',
          '✋ **You cancelled the wallet connection.**\n\n🔗 **To connect:**\n1. Click "Connect Wallet" again\n2. Approve the connection in MetaMask\n3. Select your account',
          '🚫'
        );
      } else {
        // 기타 연결 오류
        showErrorMessage(
          'Wallet Connection Failed',
          `❌ **Failed to connect wallet.**\n\n🔍 **Error Details:**\n${error.message || 'Unknown error occurred'}\n\n🔄 **Please try:**\n1. Refresh the page\n2. Check MetaMask is unlocked\n3. Try connecting again`,
          '⚠️'
        );
      }
    }
  };
  
  // 메시지 전송
  const sendMessage = (text: string, displayInChat: boolean = true) => {
    console.log('[sendMessage] 메시지 전송:', text);
    console.log('[sendMessage] 현재 지갑 주소:', walletAddress);
    
    if (!socketRef.current?.connected) {
      console.log('[sendMessage] 소켓이 연결되지 않음');
      showErrorMessage(
        'Server Connection Lost',
        '📡 **Unable to send message - server disconnected.**\n\n🔄 **Please:**\n1. Check your internet connection\n2. Refresh the page\n3. Try sending the message again',
        '📡'
      );
      return;
    }

    // 채팅에 사용자 메시지 표시
    if (displayInChat) {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        senderName: 'You',
        text: text,
        isUser: true
      };
      
      console.log('[sendMessage] 사용자 메시지 추가:', userMessage);
      setMessages(prev => [...prev, userMessage]);
      
      // 사용자 메시지 전송 후 즉시 analyzing 메시지 추가
      const analyzingMessages = [
        '🤖 Analyzing your request...',
        '🔍 Processing your message...',
        '⚡ Thinking about your request...',
        '🧠 Understanding your needs...',
        '💭 Analyzing blockchain data...'
      ];
      
      const randomMessage = analyzingMessages[Math.floor(Math.random() * analyzingMessages.length)];
      
      const analyzingMessage: ChatMessage = {
        id: uuidv4(),
        senderName: 'LootPang Agent',
        text: randomMessage,
        isUser: false,
        isAnalyzing: true
      };
      
      console.log('[sendMessage] Analyzing 메시지 추가:', analyzingMessage);
      setMessages(prev => [...prev, analyzingMessage]);
    }

    // 메시지 데이터 구조
    const messageData = {
      text: text,
      roomId: roomId.current,
      userId: walletAddress
    };

    console.log('[sendMessage] 전송할 데이터:', messageData);
    socketRef.current.emit('message', messageData);
  };

  // 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    console.log('[useEffect] 소켓 연결 설정 시작');
    
    // 소켓 연결
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('[socket] 연결됨:', socket.id);
      setIsConnected(true);
      
      // 룸 참여
      console.log(`[socket] 룸 참여: ${roomId.current}`);
      socket.emit('join', roomId.current);
    });

    // 연결 해제 이벤트
    socket.on('disconnect', () => {
      console.log('[socket] 연결 해제됨');
      setIsConnected(false);
    });

    // 메시지 브로드캐스트 수신
    socket.on('messageBroadcast', (data: any) => {
      console.log('[messageBroadcast] 메시지 수신:', data);
      
      try {
        const agentMessage: ChatMessage = {
          id: data.id || uuidv4(),
          senderName: 'LootPang Agent',
          text: data.text || 'Message received.',
          isUser: false,
          action: data.action,
          dataToSign: data.dataToSign
        };
        
        console.log('[messageBroadcast] 에이전트 메시지 추가:', agentMessage);
        
        // analyzing 메시지를 실제 응답으로 교체
        setMessages(prev => {
          // 마지막 메시지가 analyzing 메시지인지 확인
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.isAnalyzing) {
            // analyzing 메시지를 실제 응답으로 교체
            return [...prev.slice(0, -1), agentMessage];
          } else {
            // analyzing 메시지가 없으면 그냥 추가
            return [...prev, agentMessage];
          }
        });
        
      } catch (error) {
        console.error('[messageBroadcast] 메시지 처리 오류:', error);
      }
    });

    // 에러 이벤트
    socket.on('error', (error: any) => {
      console.error('[socket] Error:', error);
      showErrorMessage(
        'Server Error',
        `🚨 **Server encountered an error.**\n\n🔍 **Details:**\n${error.message || 'Unknown server error'}\n\n🔄 **Please try:**\n1. Refresh the page\n2. Wait a moment and try again\n3. Contact support if issue persists`,
        '🚨'
      );
    });

    // 연결 에러 이벤트
    socket.on('connect_error', (error: any) => {
      console.error('[socket] 연결 에러:', error);
      setIsConnected(false);
      showErrorMessage(
        'Connection Failed',
        `📡 **Unable to connect to server.**\n\n🔍 **Possible causes:**\n- Server is temporarily unavailable\n- Network connection issues\n- Firewall blocking connection\n\n🔄 **Please try:**\n1. Check your internet connection\n2. Refresh the page\n3. Try again in a few minutes`,
        '📡'
      );
    });

    // 정리 함수
    return () => {
      console.log('[useEffect] 소켓 연결 정리');
      socket.disconnect();
    };
  }, []);

  // 초기 환영 메시지 및 지갑 연결 상태 확인
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        senderName: 'LootPang Agent',
        text: `🌟 **Welcome to LootPang Cross-Chain Lending!** 🌟

I'm your quest completion assistant! Here's how I can help you:

🔗 **Cross-Chain Lending System:**
• Use **Sepolia ETH** as collateral
• Borrow **KK Tokens** on **Base Sepolia** network
• Complete quests and earn rewards!

💰 **Lending Requirements:**
• **1 KK Token** requires **~0.01 ETH** collateral
• **10 KK Tokens** requires **~0.1 ETH** collateral
• **100 KK Tokens** requires **~1.0 ETH** collateral

🚀 **Getting Started:**
1. Connect your wallet (top-right button)
2. Try: \`deposit 0.1 eth\` to add collateral
3. Then: \`borrow 10 kkcoin\` to get tokens
4. Complete quests to earn rewards!

💡 **Quick Commands:**
• \`deposit [amount] eth\` - Add collateral
• \`borrow [amount] kkcoin\` - Request loan
• \`status\` - Check your loan status

Ready to start your quest journey? 🎯`,
        isUser: false
      };
      
      setMessages([welcomeMessage]);
    }

    // 이미 연결된 지갑이 있는지 확인
    const checkExistingWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signerInstance = await provider.getSigner();
            const address = await signerInstance.getAddress();
            
            setSigner(signerInstance);
            setWalletAddress(address);
            
            console.log(`[checkExistingWallet] Existing wallet connection detected: ${address}`);
          }
        } catch (error) {
          console.log('[checkExistingWallet] No existing wallet connection:', error);
        }
      }
    };

    checkExistingWallet();
  }, []);

  return { 
    messages, 
    isConnected, 
    connectWallet, 
    sendMessage, 
    walletAddress,
    switchToBaseNetwork
  };
} 