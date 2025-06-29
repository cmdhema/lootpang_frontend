import { ethers } from 'ethers';

// EIP-712 서명 데이터 타입
export interface EIP712Data {
  domain: ethers.TypedDataDomain;
  types: Record<string, ethers.TypedDataField[]>;
  value: Record<string, any>;
}

// Socket.IO 서버에서 받는 메시지 페이로드 타입
export interface MessageBroadcastPayload {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    roomId: string;
    action?: 'AWAITING_SIGNATURE'; // "AWAITING_SIGNATURE" 같은 액션 트리거
    dataToSign?: EIP712Data; // 서명 데이터
}

// 화면에 표시될 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isUser: boolean;
  action?: 'AWAITING_SIGNATURE';
  dataToSign?: EIP712Data;
} 