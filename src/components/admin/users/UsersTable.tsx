
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface UsersTableProps {
  users: UserProfile[] | null;
  isLoading: boolean;
  onEditUser: (user: UserProfile) => void;
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

export const UsersTable = ({ users, isLoading, onEditUser }: UsersTableProps) => {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Имя</th>
            <th className="py-3 px-4 text-left">Телефон</th>
            <th className="py-3 px-4 text-left">Статус</th>
            <th className="py-3 px-4 text-left">Пропуск</th>
            <th className="py-3 px-4 text-left">Уровень</th>
            <th className="py-3 px-4 text-left">Очки</th>
            <th className="py-3 px-4 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={8} className="py-4 px-4 text-center">
                Загрузка...
              </td>
            </tr>
          ) : users?.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-4 px-4 text-center">
                Пользователи не найдены
              </td>
            </tr>
          ) : (
            users?.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-3 px-4">{user.id}</td>
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
                <td className="py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
