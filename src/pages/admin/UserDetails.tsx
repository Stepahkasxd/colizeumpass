
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

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

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

      return data as UserProfile;
    },
  });

  // Function to check admin status
  const isUserAdmin = (userId: string) => {
    // In a real app, this would check against the admin data
    return true;
  };

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
    } catch (error) {
      console.error("Error updating block status:", error);
      toast.error("Ошибка при изменении статуса блокировки");
    }
  };

  const handleToggleAdmin = (user: UserProfile) => {
    console.log("Toggle admin:", user);
    toast.info(`Изменены права администратора для ${user.display_name || 'Без имени'}`);
  };

  const handleDeleteUser = (user: UserProfile) => {
    console.log("Delete user:", user);
    toast.warning(`Удаление пользователя ${user.display_name || 'Без имени'}`);
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
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleBlockUser}
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
              onClick={() => handleDeleteUser(user)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="bg-[#e4d079]/5 hover:bg-[#e4d079]/10 text-[#e4d079] border-[#e4d079]/20"
              onClick={() => handleToggleAdmin(user)}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isUserAdmin(user.id) ? "Удалить права" : "Сделать админом"}
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
                              Получено: {reward.received_at ? format(new Date(reward.received_at), 'dd.MM.yyyy') : 'Дата неизвестна'}
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
    </div>
  );
};

export default UserDetails;
