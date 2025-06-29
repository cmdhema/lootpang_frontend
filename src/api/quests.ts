import type { LootPangQuest, QuestTab } from '@/types/quest';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface QuestCheckResponse {
  success: boolean;
  data?: {
    questId: string;
    isCompleted: boolean;
    canWithdraw: boolean;
    userBalance: string;
    minRequired: string;
    message: string;
  };
  error?: string;
  details?: string;
}

export interface QuestClaimResponse {
  success: boolean;
  data?: {
    questId: string;
    txHash: string;
    amount: number;
    token: string;
    message: string;
  };
  error?: string;
  details?: string;
}

export interface QuestListResponse {
  success: boolean;
  data: LootPangQuest[];
  error?: string;
}

// Quest 리스트 조회
export async function fetchQuests(tab: QuestTab): Promise<LootPangQuest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quests/${tab}`);
    const result: QuestListResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch quests');
    }
    
    return result.data;
  } catch (error) {
    console.error('Failed to fetch quests:', error);
    throw error;
  }
}

// Quest 달성 확인
export async function checkQuestAchievement(questId: string, walletAddress: string): Promise<QuestCheckResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quest/${questId}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    
    const result: QuestCheckResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to check quest achievement:', error);
    return {
      success: false,
      error: 'Network error occurred while checking quest achievement'
    };
  }
}

// Quest 보상 지급
export async function claimQuestReward(questId: string, walletAddress: string): Promise<QuestClaimResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quest/${questId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    
    const result: QuestClaimResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to claim quest reward:', error);
    return {
      success: false,
      error: 'Network error occurred while claiming reward'
    };
  }
} 