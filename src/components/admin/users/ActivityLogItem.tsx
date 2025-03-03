
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { ActivityLog } from "./UserActivity";

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  auth: <Activity className="h-4 w-4 text-blue-400" />,
  admin: <Activity className="h-4 w-4 text-red-400" />,
  points: <Activity className="h-4 w-4 text-green-400" />,
  rewards: <Activity className="h-4 w-4 text-yellow-400" />,
  shop: <Activity className="h-4 w-4 text-purple-400" />,
  passes: <Activity className="h-4 w-4 text-indigo-400" />,
  user: <Activity className="h-4 w-4 text-orange-400" />,
  system: <Activity className="h-4 w-4 text-gray-400" />,
};

interface ActivityLogItemProps {
  log: ActivityLog;
}

export function ActivityLogItem({ log }: ActivityLogItemProps) {
  const dateFormatted = format(new Date(log.created_at), "dd.MM.yyyy HH:mm");
  const icon = CATEGORY_ICONS[log.category] || <Activity className="h-4 w-4" />;
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-black/30 border border-[#e4d079]/10">
      <div className="mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
          <p className="font-medium text-sm text-[#e4d079]">{log.action}</p>
          <p className="text-xs text-muted-foreground">{dateFormatted}</p>
        </div>
        {log.details && (
          <p className="text-xs text-muted-foreground mt-1 break-words">
            {typeof log.details === 'object' 
              ? JSON.stringify(log.details, null, 2)
              : String(log.details)
            }
          </p>
        )}
      </div>
    </div>
  );
}
