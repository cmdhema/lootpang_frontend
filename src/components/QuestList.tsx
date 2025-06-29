import { useState, useEffect } from 'react';
import type { LootPangQuest, QuestTab } from '@/types/quest';
import { fetchQuests, checkQuestAchievement, claimQuestReward } from '@/api/quests';
import { useWalletStore } from '@/store/walletStore';

interface QuestItemProps {
  quest: LootPangQuest;
  onQuestUpdate: (questId: string, updates: Partial<LootPangQuest>) => void;
}

function QuestItem({ quest, onQuestUpdate }: QuestItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  const { address: walletAddress } = useWalletStore();

  const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage(message);
    setMessageType(type);
    // 5초 후 메시지 자동 제거
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleCheck = async () => {
    if (!walletAddress) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    setIsChecking(true);
    setStatusMessage('');

    try {
      const result = await checkQuestAchievement(quest.id, walletAddress);
      
      if (result.success && result.data) {
        // Quest 상태 업데이트
        onQuestUpdate(quest.id, {
          isCompleted: result.data.isCompleted,
          canWithdraw: result.data.canWithdraw
        });
        
        showMessage(result.data.message, result.data.isCompleted ? 'success' : 'info');
      } else {
        showMessage(result.error || 'Failed to check quest achievement', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    setIsClaiming(true);
    setStatusMessage('');

    try {
      const result = await claimQuestReward(quest.id, walletAddress);
      
      if (result.success && result.data) {
        // Quest 상태 업데이트
        onQuestUpdate(quest.id, {
          canWithdraw: false
        });
        
        showMessage(result.data.message, 'success');
      } else {
        showMessage(result.error || 'Failed to claim reward', 'error');
      }
    } catch (error) {
      showMessage('Network error occurred', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      marginBottom: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
      transition: 'all 0.2s ease'
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? '1px solid rgba(148, 163, 184, 0.2)' : 'none'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700',
            color: '#a78bfa',
            marginBottom: '4px'
          }}>
            {quest.projectName}
          </div>
          <div style={{ 
            fontSize: '16px',
            fontWeight: '600',
            color: '#e2e8f0',
            lineHeight: '1.4'
          }}>
            {quest.questName}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
          {quest.isCompleted && (
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
            }}>
              ✓
            </div>
          )}
          <div style={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease',
            color: '#94a3b8',
            fontSize: '16px'
          }}>
            ▼
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '14px',
            color: '#cbd5e1',
            lineHeight: '1.5'
          }}>
            {quest.description}
          </p>

          {/* 상태 메시지 */}
          {statusMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: messageType === 'success' 
                ? 'rgba(16, 185, 129, 0.2)' 
                : messageType === 'error'
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${
                messageType === 'success' 
                  ? 'rgba(16, 185, 129, 0.3)' 
                  : messageType === 'error'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)'
              }`,
              color: messageType === 'success' 
                ? '#10b981' 
                : messageType === 'error'
                ? '#ef4444'
                : '#3b82f6',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              {statusMessage}
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleCheck}
                disabled={quest.isCompleted || isChecking}
                style={{
                  background: quest.isCompleted 
                    ? 'rgba(30, 41, 59, 0.8)' 
                    : isChecking
                    ? 'rgba(167, 139, 250, 0.5)'
                    : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                  color: quest.isCompleted ? '#64748b' : '#1e293b',
                  border: quest.isCompleted ? '1px solid rgba(100, 116, 139, 0.3)' : 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: quest.isCompleted || isChecking ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: quest.isCompleted 
                    ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
                    : '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)',
                  opacity: isChecking ? 0.7 : 1
                }}
              >
                {isChecking ? 'Checking...' : quest.isCompleted ? '✓ Completed' : 'Check Achievement'}
              </button>
              
              {quest.canWithdraw && (
                <button
                  onClick={handleWithdraw}
                  disabled={isClaiming}
                  style={{
                    background: isClaiming
                      ? 'rgba(16, 185, 129, 0.5)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isClaiming ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)',
                    opacity: isClaiming ? 0.7 : 1
                  }}
                >
                  {isClaiming ? 'Claiming...' : 'Withdraw Reward'}
                </button>
              )}
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '700',
              color: '#1e293b',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d97706',
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
            }}>
              🎁 {quest.reward.amount} {quest.reward.token}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestList() {
  const [activeTab, setActiveTab] = useState<QuestTab>('hackathon-temp');
  const [quests, setQuests] = useState<LootPangQuest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Quest 데이터 로드
  useEffect(() => {
    loadQuests();
  }, [activeTab]);

  const loadQuests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const questData = await fetchQuests(activeTab);
      setQuests(questData);
    } catch (err) {
      setError('Failed to load quests. Please try again.');
      console.error('Failed to load quests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestUpdate = (questId: string, updates: Partial<LootPangQuest>) => {
    setQuests(prevQuests => 
      prevQuests.map(quest => 
        quest.id === questId ? { ...quest, ...updates } : quest
      )
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Headers */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '24px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => setActiveTab('lootpang-curation')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'lootpang-curation' 
              ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
              : 'transparent',
            color: activeTab === 'lootpang-curation' ? '#1e293b' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'lootpang-curation' 
              ? '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)' 
              : 'none'
          }}
        >
          LootPang Curation
        </button>
        <button
          onClick={() => setActiveTab('hackathon-temp')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'hackathon-temp' 
              ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
              : 'transparent',
            color: activeTab === 'hackathon-temp' ? '#1e293b' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'hackathon-temp' 
              ? '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)' 
              : 'none'
          }}
        >
          Hackathon Temp
        </button>
      </div>

      {/* Quest List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Loading quests...
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#ef4444',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px' }}>{error}</div>
            <button
              onClick={loadQuests}
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : quests.length === 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            No quests available
          </div>
        ) : (
          quests.map(quest => (
            <QuestItem 
              key={quest.id} 
              quest={quest} 
              onQuestUpdate={handleQuestUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
} 