
import { Star, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Premium':
      return 'text-amber-500 font-medium bg-amber-500/10 border-amber-500/30 px-2 py-0.5 rounded-full';
    case 'VIP':
      return 'text-amber-400 font-medium bg-amber-400/10 border-amber-400/30 px-2 py-0.5 rounded-full';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30 px-2 py-0.5 rounded-full';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Premium':
      return <Star className="h-3 w-3 inline mr-1" />;
    case 'VIP':
      return <Sparkles className="h-3 w-3 inline mr-1" />;
    default:
      return null;
  }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};
