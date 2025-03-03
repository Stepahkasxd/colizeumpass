
import { UserProfile } from "@/types/user";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { PassBadge } from "./PassBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { AdminBadge } from "./AdminBadge";
import { UserActionButtons } from "./UserActionButtons";
import { useNavigate } from "react-router-dom";

interface UserTableRowProps {
  user: UserProfile;
  isRoot: boolean;
  isUserAdmin: (userId: string) => boolean;
  onEditUser: (user: UserProfile) => void;
  onBlockUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onToggleAdmin: (user: UserProfile) => void;
}

const formatId = (id: string) => {
  const numericId = parseInt(id);
  return isNaN(numericId) ? id : numericId.toString().padStart(6, '0');
};

export const UserTableRow = ({
  user,
  isRoot,
  isUserAdmin,
  onEditUser,
  onBlockUser,
  onDeleteUser,
  onToggleAdmin
}: UserTableRowProps) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    console.log(`Navigating to user details: /admin/users/${user.id}`);
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <motion.tr 
      className="border-b border-[#e4d079]/10 hover:bg-[#e4d079]/5 transition-colors cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }}
      onClick={handleRowClick}
    >
      <td className="py-3 px-4 font-medium text-[#e4d079]">{formatId(user.id)}</td>
      <td className="py-3 px-4 text-foreground">{user.display_name || "—"}</td>
      <td className="py-3 px-4 text-foreground">{user.phone_number || "—"}</td>
      <td className="py-3 px-4">
        <StatusBadge status={user.status} />
      </td>
      <td className="py-3 px-4">
        <PassBadge hasPass={user.has_pass} />
      </td>
      <td className="py-3 px-4 font-medium">
        <span className="bg-[#e4d079]/10 border border-[#e4d079]/20 text-[#e4d079] px-2 py-0.5 rounded-full">
          {user.level}
        </span>
      </td>
      <td className="py-3 px-4 font-mono text-amber-400">{user.points}</td>
      <td className="py-3 px-4 font-mono text-green-400">{user.free_points}</td>
      <td className="py-3 px-4">
        <UserStatusBadge isBlocked={user.is_blocked} />
      </td>
      <td className="py-3 px-4">
        <AdminBadge isAdmin={isUserAdmin(user.id)} />
      </td>
      <td className="py-3 px-4 text-gray-400">
        {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy') : "—"}
      </td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <UserActionButtons
          user={user}
          isRoot={isRoot}
          isUserAdmin={isUserAdmin}
          onEditUser={onEditUser}
          onBlockUser={onBlockUser}
          onDeleteUser={onDeleteUser}
          onToggleAdmin={onToggleAdmin}
        />
      </td>
    </motion.tr>
  );
};
