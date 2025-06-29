import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: 'flex', 
        gap: '12px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me about quests, rewards, or how to complete challenges..."
        style={{ 
          flex: 1,
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '12px',
          padding: '14px 16px',
          fontSize: '15px',
          transition: 'all 0.2s ease',
          color: '#e2e8f0',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#a78bfa';
          e.target.style.boxShadow = '0 0 0 3px rgba(167, 139, 250, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
          e.target.style.boxShadow = 'none';
        }}
      />
      <button 
        type="submit" 
        disabled={!input.trim()}
        style={{ 
          background: input.trim() 
            ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
            : 'rgba(30, 41, 59, 0.8)',
          color: input.trim() ? '#1e293b' : '#64748b',
          border: input.trim() ? 'none' : '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: input.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          boxShadow: input.trim() 
            ? '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)' 
            : '0 1px 2px rgba(0, 0, 0, 0.3)',
          whiteSpace: 'nowrap',
          minWidth: '80px'
        }}
      >
        Send
      </button>
    </form>
  );
} 