import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 사용자가 스크롤하고 있는지 감지
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px 여유
      
      if (!isAtBottom) {
        isUserScrollingRef.current = true;
        
        // 3초 후 자동 스크롤 재개
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 3000);
      } else {
        isUserScrollingRef.current = false;
      }
    }
  };

  // 메시지가 추가될 때마다 스크롤을 아래로 이동 (사용자가 스크롤 중이 아닐 때만)
  useEffect(() => {
    if (scrollRef.current && !isUserScrollingRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ 
        width: '100%', 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid rgba(148, 163, 184, 0.2)', 
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.4)',
        marginBottom: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#64748b rgba(30, 41, 59, 0.5)'
      }}>
      {messages.map((msg) => (
        <div key={msg.id} style={{ 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: msg.isUser ? 'flex-end' : 'flex-start'
        }}>
          <div style={{
            maxWidth: '75%',
            display: 'inline-block', 
            padding: '14px 18px', 
            borderRadius: '16px', 
            background: msg.isUser 
              ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
              : 'rgba(30, 41, 59, 0.8)',
            color: msg.isUser ? '#1e293b' : '#e2e8f0',
            border: msg.isUser ? 'none' : '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: msg.isUser 
              ? '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)' 
              : '0 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              marginBottom: '6px', 
              opacity: msg.isUser ? 0.8 : 0.7,
              color: msg.isUser ? 'rgba(30, 41, 59, 0.8)' : '#94a3b8'
            }}>
              {msg.senderName}
            </div>
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              margin: 0, 
              fontFamily: 'inherit', 
              fontSize: '15px',
              lineHeight: '1.5',
              color: msg.isUser ? '#1e293b' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: msg.isAnalyzing ? '8px' : '0'
            }}>
              {msg.isAnalyzing && (
                <div style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #a78bfa',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {msg.text}
            </div>
          </div>
        </div>
      ))}
      
      {messages.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '15px'
        }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#94a3b8' }}>
              LootPang Cross-Chain Lending
            </div>
            <div>Connect your wallet to start your quest journey!</div>
          </div>
        </div>
      )}
    </div>
  );
}; 