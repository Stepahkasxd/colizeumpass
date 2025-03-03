
import { Medal } from "lucide-react";

interface PassBadgeProps {
  hasPass: boolean;
}

export const PassBadge = ({ hasPass }: PassBadgeProps) => {
  if (hasPass) {
    return (
      <span className="inline-flex items-center text-green-500 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
        <Medal className="h-3 w-3 mr-1" />
        Есть
      </span>
    );
  }
  
  return <span className="text-gray-500">Нет</span>;
};
