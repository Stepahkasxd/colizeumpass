
import { Calendar, Clock, History, Award, Star, Ticket } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

type Activity = {
  id: string;
  category: 'auth' | 'points' | 'rewards' | 'passes' | 'user' | 'system';
  action: string;
  created_at: string;
  details?: Record<string, any>;
};

interface ActivityItemProps {
  activity: Activity;
}

// Function to format date in a human-readable way
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
};

// Function to get icon for activity category
export const getActivityIcon = (category: Activity['category']) => {
  switch (category) {
    case 'rewards':
      return <Award className="h-4 w-4 text-purple-400" />;
    case 'passes':
      return <Ticket className="h-4 w-4 text-blue-400" />;
    case 'points':
      return <Star className="h-4 w-4 text-yellow-400" />;
    case 'auth':
      return <History className="h-4 w-4 text-green-400" />;
    case 'user':
    case 'system':
    default:
      return <History className="h-4 w-4 text-green-400" />;
  }
};

// Function to get badge color for activity category
export const getActivityBadge = (category: Activity['category']) => {
  switch (category) {
    case 'rewards':
      return <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-300">Награда</Badge>;
    case 'passes':
      return <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-300">Пропуск</Badge>;
    case 'points':
      return <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-300">Очки</Badge>;
    case 'auth':
      return <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-300">Вход</Badge>;
    case 'user':
      return <Badge variant="outline" className="border-teal-500/50 bg-teal-500/10 text-teal-300">Действие</Badge>;
    case 'system':
    default:
      return <Badge variant="outline" className="border-gray-500/50 bg-gray-500/10 text-gray-300">Система</Badge>;
  }
};

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <TableRow key={activity.id} className="hover:bg-black/40 border-b border-primary/5">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getActivityIcon(activity.category)}
          {getActivityBadge(activity.category)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-gray-200">{activity.action}</span>
          {activity.details?.points && (
            <span className="text-xs text-yellow-400/90">+{activity.details.points} очков</span>
          )}
          {activity.details?.price && (
            <span className="text-xs text-blue-400/90">{activity.details.price} руб.</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-sm text-gray-400">{formatDate(activity.created_at)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export type { Activity };
