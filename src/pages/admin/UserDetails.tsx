
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  ShieldX, 
  Trash2, 
  Edit, 
  Settings,
  AlertTriangle,
  Activity,
  Award
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EditUserForm } from "@/components/admin/users/EditUserForm";
import { UserSettingsForm } from "@/components/admin/users/UserSettingsForm";
import { UserActivity } from "@/components/admin/users/UserActivity";
import { UserRewards } from "@/components/admin/users/UserRewards";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Fetch user data
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (userError) throw userError;
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "admin");
      
      setIsAdmin(roleData && roleData.length > 0);
      
      return userData as UserProfile;
    },
  });
  
  const handleBlockUser = async () => {
    if (!user) return;
    
    try {
      const newBlockStatus = !user.is_blocked;
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: newBlockStatus })
        .eq("id", user.id);
        
      if (error) throw error;
      
      const action = newBlockStatus ? "заблокирован" : "разблокирован";
      toast.success(`Пользователь ${user.display_name || 'Без имени'} ${action}`);
      refetch();
    } catch (error) {
      console.error("Error updating block status:", error);
      toast.error("Ошибка при изменении статуса блокировки");
    }
  };
  
  const handleToggleAdmin = async () => {
    if (!user) return;
    
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id)
          .eq("role", "admin");
          
        if (error) throw error;
        
        toast.success(`Права администратора удалены у пользователя ${user.display_name || 'Без имени'}`);
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({
            user_id: user.id,
            role: "admin"
          });
          
        if (error) throw error;
        
        toast.success(`Права администратора добавлены пользователю ${user.display_name || 'Без имени'}`);
      }
      
      setIsAdmin(!isAdmin);
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Ошибка при изменении прав администратора");
    }
  };
  
  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      // Delete from profiles table
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success(`Пользователь ${user.display_name || 'Без имени'} удален`);
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Ошибка при удалении пользователя");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4d079]"></div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Ошибка</h1>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Пользователь не найден"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку пользователей
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/admin")}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {user.display_name || 'Пользователь без имени'}
          </h1>
          <div className="flex gap-2">
            {user.is_blocked && (
              <Badge variant="destructive">Заблокирован</Badge>
            )}
            {isAdmin && (
              <Badge variant="default" className="bg-[#e4d079] text-black hover:bg-[#e4d079]/80">
                Администратор
              </Badge>
            )}
            <Badge variant={user.has_pass ? "default" : "outline"}>
              {user.has_pass ? "Имеет пропуск" : "Без пропуска"}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Редактировать пользователя</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={user.is_blocked ? "outline" : "destructive"}
                      size="icon"
                    >
                      {user.is_blocked ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <ShieldX className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {user.is_blocked ? "Разблокировать пользователя?" : "Заблокировать пользователя?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {user.is_blocked 
                          ? "Пользователь снова сможет входить в систему." 
                          : "Пользователь не сможет войти в систему пока не будет разблокирован."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBlockUser}
                        className={user.is_blocked 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-red-600 hover:bg-red-700"}
                      >
                        {user.is_blocked ? "Разблокировать" : "Заблокировать"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.is_blocked ? "Разблокировать пользователя" : "Заблокировать пользователя"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={isAdmin ? "destructive" : "outline"}
                      size="icon"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isAdmin 
                          ? "Удалить права администратора?" 
                          : "Назначить администратором?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isAdmin 
                          ? "Пользователь потеряет доступ к панели администратора и всем административным функциям." 
                          : "Пользователь получит доступ к панели администратора и всем административным функциям."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleToggleAdmin}
                        className={isAdmin ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                      >
                        {isAdmin ? "Удалить права" : "Назначить"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isAdmin ? "Удалить права администратора" : "Назначить администратором"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Удалить пользователя?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Пользователь и все его данные будут удалены из системы.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteUser}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Удалить навсегда
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Удалить пользователя</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* User Profile Card */}
      <Card className="mb-6 bg-black/40 backdrop-blur-md border border-[#e4d079]/20 rounded-lg hover:shadow-[0_8px_20px_rgba(228,208,121,0.07)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#e4d079]" />
            Профиль пользователя
          </CardTitle>
          <CardDescription>
            Основная информация о пользователе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p className="text-sm font-mono mt-1">{user.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Дата регистрации</h3>
              <p className="text-sm mt-1">{format(new Date(user.created_at), "dd.MM.yyyy HH:mm")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Имя</h3>
              <p className="text-sm mt-1">{user.display_name || 'Не указано'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Телефон</h3>
              <p className="text-sm mt-1">{user.phone_number || 'Не указан'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Статус</h3>
              <p className="text-sm mt-1">{user.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Уровень / Очки</h3>
              <p className="text-sm mt-1">
                Уровень {user.level} ({user.points} очков)
              </p>
            </div>
            {user.bio && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">О себе</h3>
                <p className="text-sm mt-1 whitespace-pre-line">{user.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#e4d079]/20 data-[state=active]:text-[#e4d079]">
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#e4d079]/20 data-[state=active]:text-[#e4d079]">
            <Activity className="h-4 w-4 mr-2" />
            Активность
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-[#e4d079]/20 data-[state=active]:text-[#e4d079]">
            <Award className="h-4 w-4 mr-2" />
            Награды
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-0">
          <UserSettingsForm user={user} onSuccess={refetch} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <UserActivity userId={user.id} />
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-0">
          <UserRewards user={user} />
        </TabsContent>
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-black/90 border-[#e4d079]/20">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Изменение основной информации о пользователе
            </DialogDescription>
          </DialogHeader>
          <EditUserForm 
            user={user} 
            onSuccess={() => {
              setEditDialogOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
