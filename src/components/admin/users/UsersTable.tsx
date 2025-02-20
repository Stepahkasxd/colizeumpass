
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Ban, Trash2, ShieldCheck } from "lucide-react";
import type { UserProfile } from "@/types/user";

interface UsersTableProps {
  users: UserProfile[] | undefined;
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
  isUserAdmin,
}: UsersTableProps) => {
  const isRootEmail = (email: string | null) => email === 'root@root.com';
  const isCurrentUserRoot = isRootEmail(currentUserEmail);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!users?.length) {
    return <div>Нет пользователей</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Телефон</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Уровень</TableHead>
          <TableHead>Очки</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isUserRoot = isRootEmail(user.id);
          // Обычные админы не могут редактировать root пользователя
          const canEditUser = isCurrentUserRoot || (!isUserRoot && !isRootEmail(currentUserEmail));
          
          return (
            <TableRow key={user.id}>
              <TableCell className="font-mono">{user.id}</TableCell>
              <TableCell>{user.display_name || '—'}</TableCell>
              <TableCell>{user.phone_number || '—'}</TableCell>
              <TableCell>{isUserRoot ? 'Суперпользователь' : isUserAdmin(user.id) ? 'Администратор' : user.status}</TableCell>
              <TableCell>{user.level}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell className="space-x-2">
                {canEditUser && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditUser(user)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!isUserRoot && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onBlockUser(user)}
                          className={`h-8 w-8 ${user.is_blocked ? 'bg-red-500/10' : ''}`}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDeleteUser(user)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onToggleAdmin(user)}
                          className={`h-8 w-8 ${isUserAdmin(user.id) ? 'bg-green-500/10' : ''}`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
