
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit2, Ban, Trash2, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface UserActionButtonsProps {
  user: UserProfile;
  isRoot: boolean;
  isUserAdmin: (userId: string) => boolean;
  onEditUser: (user: UserProfile) => void;
  onBlockUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onToggleAdmin: (user: UserProfile) => void;
}

export const UserActionButtons = ({
  user,
  isRoot,
  isUserAdmin,
  onEditUser,
  onBlockUser,
  onDeleteUser,
  onToggleAdmin
}: UserActionButtonsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  
  const isAdmin = isUserAdmin(user.id);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditUser(user);
  };
  
  const handleDeleteClick = () => {
    onDeleteUser(user);
    setShowDeleteDialog(false);
  };
  
  const handleBlockClick = () => {
    onBlockUser(user);
    setShowBlockDialog(false);
  };
  
  const handleAdminClick = () => {
    onToggleAdmin(user);
    setShowAdminDialog(false);
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="hover:bg-[#e4d079]/10 hover:text-[#e4d079] transition-colors"
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
              onClick={(e) => {
                e.stopPropagation();
                setShowBlockDialog(true);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdminDialog(true);
                }}
                className={
                  isAdmin 
                    ? "text-[#e4d079] hover:bg-[#e4d079]/10 hover:text-[#e4d079]" 
                    : "text-gray-500 hover:bg-gray-500/10 hover:text-gray-400"
                }
              >
                <Shield className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isAdmin ? "Удалить права админа" : "Сделать администратором"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.is_blocked ? "Разблокировать пользователя" : "Заблокировать пользователя"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_blocked 
                ? `Вы уверены, что хотите разблокировать пользователя ${user.display_name || 'Без имени'}?`
                : `Вы уверены, что хотите заблокировать пользователя ${user.display_name || 'Без имени'}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockClick}
              className={user.is_blocked 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-red-500 hover:bg-red-600 text-white"}
            >
              {user.is_blocked ? "Разблокировать" : "Заблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление пользователя</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя {user.display_name || 'Без имени'}? 
              Это действие необратимо и удалит все данные пользователя.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Admin Confirmation Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAdmin ? "Удаление прав администратора" : "Назначение администратором"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin 
                ? `Вы уверены, что хотите удалить права администратора у ${user.display_name || 'Без имени'}?`
                : `Вы уверены, что хотите назначить ${user.display_name || 'Без имени'} администратором?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAdminClick}
              className="bg-[#e4d079]/20 hover:bg-[#e4d079]/30 text-[#e4d079]"
            >
              {isAdmin ? "Удалить права" : "Назначить администратором"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
