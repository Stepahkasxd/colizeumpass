
import { UserProfile } from "@/types/user";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { UserTableHeader } from "./table/UserTableHeader";
import { UserTableRow } from "./table/UserTableRow";
import { TableLoadingState } from "./table/TableLoadingState";
import { EmptyTableState } from "./table/EmptyTableState";

interface UsersTableProps {
  users: UserProfile[] | null;
  isLoading: boolean;
  currentUserEmail: string | null;
  onEditUser: (user: UserProfile) => void;
  onBlockUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onToggleAdmin: (user: UserProfile) => void;
  isUserAdmin: (userId: string) => boolean;
}

export const UsersTable = ({ 
  users, 
  isLoading, 
  currentUserEmail,
  onEditUser, 
  onBlockUser,
  onDeleteUser,
  onToggleAdmin,
  isUserAdmin
}: UsersTableProps) => {
  const isRoot = currentUserEmail === 'root@root.com';

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      } 
    }
  };

  return (
    <div className="rounded-md border admin-border overflow-hidden bg-black/20 backdrop-blur-sm shadow-sm">
      <ScrollArea className="h-[calc(100vh-440px)]">
        <div className="min-w-[1200px]">
          <table className="w-full text-sm">
            <UserTableHeader />
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                <TableLoadingState />
              ) : !users || users.length === 0 ? (
                <EmptyTableState />
              ) : (
                users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    isRoot={isRoot}
                    isUserAdmin={isUserAdmin}
                    onEditUser={onEditUser}
                    onBlockUser={onBlockUser}
                    onDeleteUser={onDeleteUser}
                    onToggleAdmin={onToggleAdmin}
                  />
                ))
              )}
            </motion.tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
