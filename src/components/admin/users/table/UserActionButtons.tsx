
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Edit2, Ban, Trash2, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(user)}
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
                    ? "text-[#e4d079] hover:bg-[#e4d079]/10 hover:text-[#e4d079]" 
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
  );
};
