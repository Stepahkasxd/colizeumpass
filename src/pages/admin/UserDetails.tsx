
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/users/table/StatusBadge";
import { PassBadge } from "@/components/admin/users/table/PassBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit2, Ban, Shield, Trash2, BarChart, History, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_STATUSES } from "@/types/user";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  
  // Form states for editing
  const [editForm, setEditForm] = useState({
    display_name: "",
    phone_number: "",
    status: ""
  });

  // Get admin status for the user
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch if user is admin
  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin');
        
      if (error) {
        console.error("Error fetching admin status:", error);
        return;
      }
      
      setIsAdmin(data && data.length > 0);
    };
    
    fetchAdminStatus();
  }, [userId]);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        throw error;
      }

      // Ensure rewards is always an array
      const userWithFormattedRewards = {
        ...data,
        rewards: Array.isArray(data.rewards) ? data.rewards : []
      } as UserProfile;

      return userWithFormattedRewards;
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      setEditForm({
        display_name: user.display_name || "",
        phone_number: user.phone_number || "",
        status: user.status || "Standard"
      });
    }
  }, [user]);

  const handleGoBack = () => {
    navigate("/admin");
  };

  const handleBlockUser = async () => {
    if (!user) return;

    try {
      const newBlockStatus = !user.is_blocked;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlockStatus })
        .eq('id', user.id);
        
      if (error) throw error;
      
      const action = newBlockStatus ? "заблокирован" : "разблокирован";
      toast.success(`Пользователь ${user.display_name || 'Без имени'} ${action}`);
      refetch();
      setShowBlockDialog(false);
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
          .from('user_roles')
          .delete()
          .eq('user_id', user.id)
          .eq('role', 'admin');
          
        if (error) throw error;
        
        toast.success(`Права администратора удалены у ${user.display_name || 'Без имени'}`);
        setIsAdmin(false);
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          });
          
        if (error) throw error;
        
        toast.success(`${user.display_name || 'Без имени'} назначен администратором`);
        setIsAdmin(true);
      }
      setShowAdminDialog(false);
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Ошибка при изменении прав администратора");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      // First, delete from user_roles if they are an admin
      if (isAdmin) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
      }
      
      // Then delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success(`Пользователь ${user.display_name || 'Без имени'} удален`);
      navigate('/admin');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Ошибка при удалении пользователя");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleSaveEdit = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          phone_number: editForm.phone_number,
          status: editForm.status
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success(`Пользователь ${editForm.display_name || 'Без имени'} обновлен`);
      refetch();
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Ошибка при обновлении пользователя");
    }
  };

  const handleEditUser = () => {
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Загрузка данных пользователя...</h1>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Пользователь не найден</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Произошла ошибка при загрузке данных пользователя или пользователь не существует.
            </p>
            <Button onClick={handleGoBack} className="mt-4">
              Вернуться к списку пользователей
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2 hover:bg-[#e4d079]/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку
        </Button>
        <h1 className="text-2xl font-bold admin-text">{user.display_name || "Пользователь"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-black/20 border-[#e4d079]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="admin-text">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ID</p>
              <p className="font-mono text-sm text-[#e4d079]">{user.id}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Имя</p>
              <p>{user.display_name || "—"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Телефон</p>
              <p>{user.phone_number || "—"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Статус</p>
              <StatusBadge status={user.status} />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Пропуск</p>
              <PassBadge hasPass={user.has_pass} />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Состояние</p>
              <Badge variant={user.is_blocked ? "destructive" : "outline"}>
                {user.is_blocked ? "Заблокирован" : "Активен"}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Дата регистрации</p>
              <p className="text-sm text-gray-400">
                {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy HH:mm') : "—"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              variant="outline" 
              size="sm"
              className="bg-[#e4d079]/5 hover:bg-[#e4d079]/10 text-[#e4d079] border-[#e4d079]/20"
              onClick={handleEditUser}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setShowBlockDialog(true)}
              className={
                user.is_blocked 
                  ? "bg-green-500/5 hover:bg-green-500/10 text-green-500 border-green-500/20" 
                  : "bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/20"
              }
            >
              <Ban className="h-4 w-4 mr-2" />
              {user.is_blocked ? "Разблокировать" : "Заблокировать"}
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/20"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="bg-[#e4d079]/5 hover:bg-[#e4d079]/10 text-[#e4d079] border-[#e4d079]/20"
              onClick={() => setShowAdminDialog(true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isAdmin ? "Удалить права" : "Сделать админом"}
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 bg-black/20 border-[#e4d079]/20">
              <TabsTrigger value="stats" className="data-[state=active]:bg-[#e4d079]/10 data-[state=active]:text-[#e4d079]">
                <BarChart className="h-4 w-4 mr-2" />
                Статистика
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#e4d079]/10 data-[state=active]:text-[#e4d079]">
                <History className="h-4 w-4 mr-2" />
                Активность
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-[#e4d079]/10 data-[state=active]:text-[#e4d079]">
                <User className="h-4 w-4 mr-2" />
                Награды
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#e4d079]/10 data-[state=active]:text-[#e4d079]">
                <Settings className="h-4 w-4 mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <Card className="bg-black/20 border-[#e4d079]/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="admin-text">Статистика пользователя</CardTitle>
                  <CardDescription>
                    Подробная информация о прогрессе и активности пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg border border-[#e4d079]/20 p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Уровень</h3>
                      <p className="text-2xl font-bold text-[#e4d079]">{user.level}</p>
                    </div>
                    <div className="rounded-lg border border-[#e4d079]/20 p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Очки прогресса</h3>
                      <p className="text-2xl font-bold text-amber-400">{user.points}</p>
                    </div>
                    <div className="rounded-lg border border-[#e4d079]/20 p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Свободные очки</h3>
                      <p className="text-2xl font-bold text-green-400">{user.free_points}</p>
                    </div>
                    <div className="rounded-lg border border-[#e4d079]/20 p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Количество наград</h3>
                      <p className="text-2xl font-bold text-blue-400">{user.rewards?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card className="bg-black/20 border-[#e4d079]/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="admin-text">История активности</CardTitle>
                  <CardDescription>
                    Последние действия пользователя в системе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center py-4">
                        Пока нет данных об активности
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rewards">
              <Card className="bg-black/20 border-[#e4d079]/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="admin-text">Награды пользователя</CardTitle>
                  <CardDescription>
                    Все полученные пользователем награды и бонусы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] pr-4">
                    {user.rewards && user.rewards.length > 0 ? (
                      <div className="space-y-4">
                        {user.rewards.map((reward, index) => (
                          <div key={index} className="border border-[#e4d079]/20 rounded-lg p-4">
                            <h3 className="font-medium text-[#e4d079]">{reward.name}</h3>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Получено: {reward.earnedAt ? format(new Date(reward.earnedAt), 'dd.MM.yyyy') : 'Дата неизвестна'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        У пользователя пока нет наград
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="bg-black/20 border-[#e4d079]/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="admin-text">Настройки пользователя</CardTitle>
                  <CardDescription>
                    Управление настройками и правами пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-4">
                    Функциональность в разработке
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
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
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock User Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
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
              onClick={handleBlockUser}
              className={user.is_blocked 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-red-500 hover:bg-red-600 text-white"}
            >
              {user.is_blocked ? "Разблокировать" : "Заблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Admin Rights Confirmation Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent className="bg-black/90 border-[#e4d079]/20">
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
              onClick={handleToggleAdmin}
              className="bg-[#e4d079]/20 hover:bg-[#e4d079]/30 text-[#e4d079]"
            >
              {isAdmin ? "Удалить права" : "Назначить администратором"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-black/90 border-[#e4d079]/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              Редактирование данных пользователя {user.display_name || 'Без имени'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Имя</Label>
              <Input 
                id="name" 
                value={editForm.display_name} 
                onChange={(e) => handleEditFormChange('display_name', e.target.value)}
                className="col-span-3 bg-black/30 border-[#e4d079]/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Телефон</Label>
              <Input 
                id="phone" 
                value={editForm.phone_number} 
                onChange={(e) => handleEditFormChange('phone_number', e.target.value)}
                className="col-span-3 bg-black/30 border-[#e4d079]/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Статус</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(value) => handleEditFormChange('status', value)}
              >
                <SelectTrigger className="col-span-3 bg-black/30 border-[#e4d079]/20">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-[#e4d079]/20">
                  {USER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-[#e4d079]/20 hover:bg-[#e4d079]/10 hover:text-[#e4d079]">
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#e4d079]/20 hover:bg-[#e4d079]/30 text-[#e4d079]">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetails;
