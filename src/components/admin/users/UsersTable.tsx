
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit2, Ban, Trash2, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Premium':
      return 'text-amber-500 font-medium';
    case 'VIP':
      return 'text-purple-500 font-medium';
    default:
      return 'text-gray-600';
  }
};

const formatId = (id: string) => {
  const numericId = parseInt(id);
  return isNaN(numericId) ? id : numericId.toString().padStart(6, '0');
};

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

  return (
    <div className="rounded-md border">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="min-w-[1200px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-[120px] py-3 px-4 text-left">ID</th>
                <th className="w-[200px] py-3 px-4 text-left">Имя</th>
                <th className="w-[150px] py-3 px-4 text-left">Телефон</th>
                <th className="w-[100px] py-3 px-4 text-left">Статус</th>
                <th className="w-[100px] py-3 px-4 text-left">Пропуск</th>
                <th className="w-[80px] py-3 px-4 text-left">Уровень</th>
                <th className="w-[120px] py-3 px-4 text-left">Очки прогресса</th>
                <th className="w-[120px] py-3 px-4 text-left">Свободные очки</th>
                <th className="w-[120px] py-3 px-4 text-left">Состояние</th>
                <th className="w-[100px] py-3 px-4 text-left">Роль</th>
                <th className="w-[150px] py-3 px-4 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center">
                    Загрузка...
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-4 px-4 text-center">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{formatId(user.id)}</td>
                    <td className="py-3 px-4">{user.display_name || "—"}</td>
                    <td className="py-3 px-4">{user.phone_number || "—"}</td>
                    <td className={`py-3 px-4 ${getStatusColor(user.status)}`}>
                      {user.status}
                    </td>
                    <td className="py-3 px-4">
                      {user.has_pass ? "Есть" : "Нет"}
                    </td>
                    <td className="py-3 px-4">{user.level}</td>
                    <td className="py-3 px-4">{user.points}</td>
                    <td className="py-3 px-4">{user.free_points}</td>
                    <td className="py-3 px-4">
                      {user.is_blocked ? (
                        <span className="text-red-500 font-medium">Заблокирован</span>
                      ) : (
                        <span className="text-green-500 font-medium">Активен</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isUserAdmin(user.id) ? (
                        <span className="text-purple-500 font-medium">Админ</span>
                      ) : (
                        <span className="text-gray-600">Пользователь</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBlockUser(user)}
                          className={user.is_blocked ? "text-green-500" : "text-red-500"}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteUser(user)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {isRoot && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleAdmin(user)}
                            className={isUserAdmin(user.id) ? "text-purple-500" : "text-gray-500"}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
};
