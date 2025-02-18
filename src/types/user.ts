
export type UserProfile = {
  id: string;
  display_name: string | null;
  phone_number: string | null;
  level: number;
  points: number;
  status: 'Standard' | 'Premium' | 'VIP';
  has_pass: boolean;
};

export const USER_STATUSES = ['Standard', 'Premium', 'VIP'] as const;
