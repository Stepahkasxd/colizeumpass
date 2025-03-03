
import { Shield } from "lucide-react";

interface AdminBadgeProps {
  isAdmin: boolean;
}

export const AdminBadge = ({ isAdmin }: AdminBadgeProps) => {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center text-[#e4d079] bg-[#e4d079]/10 border border-[#e4d079]/30 px-2 py-0.5 rounded-full font-medium">
        <Shield className="h-3 w-3 mr-1" />
        Админ
      </span>
    );
  }
  
  return <span className="text-gray-500">Пользователь</span>;
};
