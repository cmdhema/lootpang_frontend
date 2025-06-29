import type { Quest } from '@/types/quest';

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  return (
    <div className="card" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '24px',
      margin: '16px',
      width: '320px',
      height: '280px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 그라데이션 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }} />
      
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            color: '#2d3748',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {quest.space_alias}
          </h3>
          <div style={{
            fontSize: '12px',
            color: '#718096',
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            {quest.distribution_type}
          </div>
        </div>
        
        {quest.win_rate_percent && (
          <div style={{
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)'
          }}>
            {quest.win_rate_percent}% Win
          </div>
        )}
      </div>

      {/* 보상 정보 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
            Reward
          </span>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#667eea'
          }}>
            {quest.user_per_reward} {quest.token_symbol}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
            Participants
          </span>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
            {quest.participants_count} / {quest.cap > 0 ? quest.cap : '∞'}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <a 
        href={quest.quest_url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textDecoration: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}
      >
        🚀 Join Quest
      </a>
    </div>
  );
} 