
export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  user_id: string;
  updated_at: string;
  assigned_to?: string | null;
  is_archived: boolean;
};

export const STATUS_LABELS = {
  open: 'Открыт',
  in_progress: 'В работе',
  resolved: 'Решен',
  closed: 'Закрыт'
} as const;
