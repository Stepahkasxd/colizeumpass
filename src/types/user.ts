
export type Reward = {
  id: string;
  name: string;
  status: "available" | "claimed";
  earnedAt: string;
  description?: string;
  passLevel?: number;
};

export type UserProfile = {
  id: string;
  created_at: string;
  display_name: string | null;
  phone_number: string | null;
  level: number;
  points: number;
  status: 'Standard' | 'Premium' | 'VIP';
  has_pass: boolean;
  rewards: Reward[];
};

export const USER_STATUSES = ['Standard', 'Premium', 'VIP'] as const;
