
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit2, Ban, Trash2, Shield, Star, Sparkles, Medal, Users } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      return 'text-amber-500 font-medium bg-amber-500/10 border-amber-500/30 px-2 py-0.5 rounded-full';
    case 'VIP':
      return 'text-purple-500 font-medium bg-purple-500/10 border-purple-500/30 px-2 py-0.5 rounded-full';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30 px-2 py-0.5 rounded-full';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Premium':
      return <Star className="h-3 w-3 inline mr-1" />;
    case 'VIP':
      return <Sparkles className="h-3 w-3 inline mr-1" />;
    default:
      return null;
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

  // Animation variants for the table rows
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      } 
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Проверим, что users не undefined перед рендерингом
  console.log("UsersTable rendered with users:", users);

  return (
    <div className="rounded-md border border-purple-500/20 overflow-hidden bg-black/20 backdrop-blur-sm shadow-sm">
      <ScrollArea className="h-[calc(100vh-440px)]">
        <div className="min-w-[1200px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-purple-500/5">
                <th className="w-[120px] py-3 px-4 text-left font-medium text-purple-300/70">ID</th>
                <th className="w-[180px] py-3 px-4 text-left font-medium text-purple-300/70">Имя</th>
                <th className="w-[140px] py-3 px-4 text-left font-medium text-purple-300/70">Телефон</th>
                <th className="w-[100px] py-3 px-4 text-left font-medium text-purple-300/70">Статус</th>
                <th className="w-[100px] py-3 px-4 text-left font-medium text-purple-300/70">Пропуск</th>
                <th className="w-[80px] py-3 px-4 text-left font-medium text-purple-300/70">Уровень</th>
                <th className="w-[100px] py-3 px-4 text-left font-medium text-purple-300/70">Очки прогресса</th>
                <th className="w-[100px] py-3 px-4 text-left font-medium text-purple-300/70">Свободные очки</th>
                <th className="w-[120px] py-3 px-4 text-left font-medium text-purple-300/70">Состояние</th>
                <th className="w-[100px] py-3 px-4 text-left font-medium text-purple-300/70">Роль</th>
                <th className="w-[160px] py-3 px-4 text-left font-medium text-purple-300/70">Дата регистрации</th>
                <th className="w-[150px] py-3 px-4 text-left font-medium text-purple-300/70">Действия</th>
              </tr>
            </thead>
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-20 px-4 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full"></div>
                      <p>Загрузка пользователей...</p>
                    </div>
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-20 px-4 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-purple-500/50" />
                      <p>Пользователи не найдены</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                    variants={rowVariants}
                  >
                    <td className="py-3 px-4 font-medium text-purple-300">{formatId(user.id)}</td>
                    <td className="py-3 px-4 text-foreground">{user.display_name || "—"}</td>
                    <td className="py-3 px-4 text-foreground">{user.phone_number || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center border ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.has_pass ? (
                        <span className="inline-flex items-center text-green-500 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                          <Medal className="h-3 w-3 mr-1" />
                          Есть
                        </span>
                      ) : (
                        <span className="text-gray-500">Нет</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {user.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">{user.points}</td>
                    <td className="py-3 px-4 font-mono text-green-400">{user.free_points}</td>
                    <td className="py-3 px-4">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                          Заблокирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-green-500 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                          Активен
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isUserAdmin(user.id) ? (
                        <span className="inline-flex items-center text-purple-500 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
                          <Shield className="h-3 w-3 mr-1" />
                          Админ
                        </span>
                      ) : (
                        <span className="text-gray-500">Пользователь</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy') : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditUser(user)}
                                className="hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Редактировать</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onBlockUser(user)}
                                className={
                                  user.is_blocked 
                                    ? "text-green-500 hover:bg-green-500/10 hover:text-green-400" 
                                    : "text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.is_blocked ? "Разблокировать" : "Заблокировать"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteUser(user)}
                                className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Удалить</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {isRoot && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onToggleAdmin(user)}
                                  className={
                                    isUserAdmin(user.id) 
                                      ? "text-purple-500 hover:bg-purple-500/10 hover:text-purple-400" 
                                      : "text-gray-500 hover:bg-gray-500/10 hover:text-gray-400"
                                  }
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isUserAdmin(user.id) ? "Удалить права админа" : "Сделать администратором"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                  </motion.tr>
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
