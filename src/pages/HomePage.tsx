import React, { useState, useRef, useCallback } from 'react';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';
import { ChatHistory } from '@/components/ChatHistory';
import { QuestList } from '@/components/QuestList';

export function HomePage() {
  const { messages, sendMessage } = useChat();
  const [leftWidth, setLeftWidth] = useState(70); // 70% for quest list, 30% for chat
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit the width between 30% and 80%
    if (newLeftWidth >= 30 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div style={{ 
      width: '100%',
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Title Section */}
      <div style={{
        textAlign: 'center',
        padding: '40px 0',
        background: 'rgba(15, 23, 42, 0.6)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Cosmic particles */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '2px',
          height: '2px',
          background: '#e2e8f0',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(226, 232, 240, 0.8)',
          animation: 'twinkle 3s infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '1px',
          height: '1px',
          background: '#a78bfa',
          borderRadius: '50%',
          boxShadow: '0 0 4px rgba(167, 139, 250, 0.8)',
          animation: 'twinkle 2s infinite 0.5s'
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: '1.5px',
          height: '1.5px',
          background: '#c4b5fd',
          borderRadius: '50%',
          boxShadow: '0 0 5px rgba(196, 181, 253, 0.8)',
          animation: 'twinkle 2.5s infinite 1s'
        }} />
        
        <h1 style={{
          fontSize: '42px', 
          margin: 0,
          fontWeight: '800',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          textShadow: '0 0 20px rgba(248, 250, 252, 0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          LootPang Quest AI Agent
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          margin: '12px 0 0 0',
          fontWeight: '500',
          textShadow: '0 0 10px rgba(148, 163, 184, 0.5)'
        }}>
          Discover cosmic quests and earn stellar rewards across the galaxy
        </p>
      </div>
      
      {/* Main Content Area */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1,
          display: 'flex',
          minHeight: 'calc(100vh - 200px)',
          gap: '0'
        }}
      >
        {/* Quest List Panel */}
        <div style={{
          width: `${leftWidth}%`,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.2)',
          padding: '24px',
          overflowY: 'auto'
        }}>
          <QuestList />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: '6px',
            background: isDragging 
              ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
              : 'rgba(148, 163, 184, 0.3)',
            cursor: 'col-resize',
            transition: isDragging ? 'none' : 'background 0.2s ease',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            width: '24px',
            height: '48px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 10px rgba(148, 163, 184, 0.2)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            ⋮⋮
          </div>
        </div>

        {/* Chat Panel */}
        <div style={{
          width: `${100 - leftWidth}%`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.2)',
          padding: '24px'
        }}>
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <ChatHistory messages={messages} />
            <ChatInput onSendMessage={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
} 