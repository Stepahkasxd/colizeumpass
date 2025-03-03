
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
  free_points: number;
  status: 'Standard' | 'Premium' | 'VIP';
  has_pass: boolean;
  rewards: Reward[] | any[]; // Make rewards more flexible to handle JSON from Supabase
  is_blocked: boolean;
  bio?: string | null;
};

export type PassLevel = {
  level: number;
  points_required: number;
  reward: {
    name: string;
    description?: string;
  };
};

export type Pass = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  levels: PassLevel[];
};

export const USER_STATUSES = ['Standard', 'Premium', 'VIP'] as const;
