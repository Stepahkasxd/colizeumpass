
interface UserStatusBadgeProps {
  isBlocked: boolean;
}

export const UserStatusBadge = ({ isBlocked }: UserStatusBadgeProps) => {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
        Заблокирован
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center text-green-500 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
      Активен
    </span>
  );
};
