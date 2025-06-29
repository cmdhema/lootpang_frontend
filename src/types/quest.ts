export interface Quest {
  quest_id: string;
  distribution_type: string;
  token_symbol: string;
  start_time: number;
  end_time: number;
  space_alias: string;
  created_at: string;
  user_per_reward: number | null;
  gas_type: string;
  cap: number;
  participants_count: number;
  win_rate_percent: string | null;
  credentials_count: number;
  credential_groups_count: number;
  rewards_count: number;
  quest_url: string;
}

export interface LootPangQuest {
  id: string;
  projectName: string;
  questName: string;
  description: string;
  reward: {
    amount: number;
    token: string;
  };
  isCompleted: boolean;
  canWithdraw: boolean;
}

export type QuestTab = 'lootpang-curation' | 'hackathon-temp'; 