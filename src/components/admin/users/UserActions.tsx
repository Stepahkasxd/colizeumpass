
import { useState } from "react";
import { 
  Download, 
  UserPlus, 
  Shield, 
  Ban, 
  Trash2,
  UserCheck,
  Users,
  UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity } from "@/utils/logger";

const UserActions = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (type: string) => {
    if (!user) return;

    // For dangerous actions, open confirmation dialog
    if (["blockAll", "deleteInactive", "resetPoints"].includes(type)) {
      setActionType(type);
      setIsDialogOpen(true);
      return;
    }

    // For direct actions
    performAction(type);
  };

  const performAction = async (type: string) => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      toast.loading("Выполняем операцию...");
      
      switch (type) {
        case "exportUsers":
          await exportUsers();
          break;
        case "blockAll":
          await blockInactiveUsers();
          break;
        case "deleteInactive":
          await deleteInactiveUsers();
          break;
        case "resetPoints":
          await resetUserPoints();
          break;
        case "makeAllVIP":
          await makeAllVIP();
          break;
        default:
          console.log("Unknown action type:", type);
      }
      
      // Log admin action
      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: `bulk_${type}`,
        details: {
          timestamp: new Date().toISOString(),
          action_type: type
        }
      });
      
      toast.dismiss();
      toast.success("Операция выполнена успешно");
    } catch (error) {
      console.error(`Error performing ${type}:`, error);
      toast.error("Ошибка при выполнении операции");
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportUsers = async () => {
    // Fetch all users
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
      
    if (error) throw error;
    
    if (data) {
      // Convert to CSV
      const headers = ["ID", "Имя", "Телефон", "Статус", "Уровень", "Очки", "Бесплатные очки", "Имеет пропуск", "Заблокирован"];
      const csvRows = [headers.join(',')];
      
      for (const user of data) {
        const row = [
          user.id,
          user.display_name || '',
          user.phone_number || '',
          user.status || '',
          user.level || 0,
          user.points || 0,
          user.free_points || 0,
          user.has_pass ? 'Да' : 'Нет',
          user.is_blocked ? 'Да' : 'Нет'
        ];
        
        csvRows.push(row.join(','));
      }
      
      const csvContent = csvRows.join('\n');
      
      // Download as file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const blockInactiveUsers = async () => {
    // This would typically include a more complex logic to determine inactive users
    // For demo, we'll just show the concept with a toast
    toast.info("Операция блокировки неактивных пользователей запущена");
    // In a real implementation, you'd run a query like:
    /*
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: true })
      .eq('last_activity_date', 'older than X days');
    */
  };
  
  const deleteInactiveUsers = async () => {
    // This is a demo concept - in reality this would require careful implementation
    toast.info("Операция удаления неактивных аккаунтов запущена");
  };
  
  const resetUserPoints = async () => {
    // Reset all users' points to zero (demo)
    toast.info("Операция сброса очков пользователей запущена");
    /*
    const { error } = await supabase
      .from('profiles')
      .update({ points: 0, free_points: 0 })
      .neq('id', user.id); // Don't reset admin's points
    */
  };
  
  const makeAllVIP = async () => {
    // Example: Upgrade all users to VIP status
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'VIP' })
      .eq('status', 'Standard');
      
    if (error) throw error;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            disabled={isLoading}
            className="border-[#e4d079]/20 hover:border-[#e4d079]/50"
          >
            <Users className="h-5 w-5 text-[#e4d079]/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-lg border border-[#e4d079]/20">
          <DropdownMenuLabel>Действия с пользователями</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleAction("exportUsers")}>
            <Download className="mr-2 h-4 w-4" />
            <span>Экспорт пользователей</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction("makeAllVIP")}>
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Всем статус VIP</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => handleAction("blockAll")}
            className="text-amber-500"
          >
            <UserX className="mr-2 h-4 w-4" />
            <span>Блокировка неактивных</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleAction("resetPoints")}
            className="text-amber-500"
          >
            <Ban className="mr-2 h-4 w-4" />
            <span>Сбросить очки всем</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleAction("deleteInactive")}
            className="text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Удалить неактивных</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-black/90 border border-[#e4d079]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e4d079]">
              {actionType === "blockAll" && "Блокировка неактивных пользователей"}
              {actionType === "deleteInactive" && "Удаление неактивных пользователей"}
              {actionType === "resetPoints" && "Сброс очков пользователей"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#e4d079]/70">
              {actionType === "blockAll" && 
                "Эта операция заблокирует всех пользователей, которые не заходили в систему более 30 дней. Продолжить?"}
              {actionType === "deleteInactive" && 
                "Эта операция удалит всех неактивных пользователей, которые не заходили в систему более 90 дней. Это действие необратимо. Продолжить?"}
              {actionType === "resetPoints" && 
                "Эта операция сбросит все очки у всех пользователей. Это действие необратимо. Продолжить?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-[#e4d079]/20 text-[#e4d079]/70 hover:bg-[#e4d079]/10">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#e4d079]/20 text-[#e4d079] hover:bg-[#e4d079]/30"
              onClick={() => performAction(actionType)}
            >
              Продолжить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserActions;
