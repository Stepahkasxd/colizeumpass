import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, Users, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { UserProfile, Reward, USER_STATUSES } from "@/types/user";
import { UsersTable } from "./users/UsersTable";
import { EditUserForm } from "./users/EditUserForm";
import { Json } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleAdminDialogOpen, setIsToggleAdminDialogOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);

  const validateUserStatus = (status: string): "Standard" | "Premium" | "VIP" => {
    if (USER_STATUSES.includes(status as any)) {
      return status as "Standard" | "Premium" | "VIP";
    }
    return "Standard";
  };

  const validateRewards = (rawRewards: any): Reward[] => {
    if (!Array.isArray(rawRewards)) {
      return [];
    }
    
    return rawRewards.map(reward => ({
      id: reward.id || crypto.randomUUID(),
      name: reward.name || 'Unknown Reward',
      status: reward.status === 'claimed' ? 'claimed' : 'available',
      earnedAt: reward.earnedAt || reward.earned_at || new Date().toISOString(),
      description: reward.description,
      passLevel: reward.passLevel || reward.pass_level
    }));
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (!error && data) {
        setAdminUsers(data.map(role => role.user_id));
      }
    };
    fetchAdminUsers();
  }, []);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*');

      if (searchTerm) {
        query = query.or(`phone_number.ilike.%${searchTerm}%,id.eq.${searchTerm}`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      console.log("Fetched users:", data);
      return (data || []).map(profile => ({
        id: profile.id,
        created_at: profile.created_at,
        display_name: profile.display_name,
        phone_number: profile.phone_number,
        level: profile.level || 1,
        points: profile.points || 0,
        free_points: profile.free_points || 0,
        status: validateUserStatus(profile.status || 'Standard'),
        has_pass: !!profile.has_pass,
        rewards: validateRewards(profile.rewards || []),
        is_blocked: !!profile.is_blocked
      })) as UserProfile[];
    }
  });

  useEffect(() => {
    console.log("UsersTab rendered, users:", users, "isLoading:", isLoading);
  }, [users, isLoading]);

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleBlockUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleAdmin = (user: UserProfile) => {
    setSelectedUser(user);
    setIsToggleAdminDialogOpen(true);
  };

  const handleSubmit = async (data: UserProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          phone_number: data.phone_number,
          level: data.level,
          points: data.points,
          free_points: data.free_points,
          status: data.status,
          has_pass: data.has_pass,
        })
        .eq('id', data.id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Данные пользователя обновлены",
      });

      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
    }
  };

  const handleBlockConfirm = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_blocked: !selectedUser.is_blocked
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: selectedUser.is_blocked 
          ? "Пользователь разблокирован" 
          : "Пользователь заблокирован",
      });

      setIsBlockDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус блокировки",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.id },
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Пользователь удален",
      });

      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdminConfirm = async () => {
    if (!selectedUser) return;

    try {
      const isCurrentlyAdmin = adminUsers.includes(selectedUser.id);

      if (isCurrentlyAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.id,
            role: 'admin'
          });

        if (error) throw error;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (!error && data) {
        setAdminUsers(data.map(role => role.user_id));
      }

      toast({
        title: "Успех",
        description: isCurrentlyAdmin 
          ? "Права администратора удалены" 
          : "Права администратора добавлены",
      });

      setIsToggleAdminDialogOpen(false);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить права администратора",
        variant: "destructive",
      });
    }
  };

  const isUserAdmin = (userId: string) => {
    return adminUsers.includes(userId);
  };

  const totalUsers = users?.length || 0;
  const premiumUsers = users?.filter(user => user.status === 'Premium' || user.status === 'VIP').length || 0;
  const blockedUsers = users?.filter(user => user.is_blocked).length || 0;
  const adminCount = adminUsers.length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего пользователей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Premium пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-amber-400" />
                <div className="text-2xl font-bold text-foreground">{premiumUsers}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Заблокированные</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-red-400" />
                <div className="text-2xl font-bold text-foreground">{blockedUsers}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Администраторы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-purple-400" />
                <div className="text-2xl font-bold text-foreground">{adminCount}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="border border-purple-500/20 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по ID или номеру телефона..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-500/20 focus:border-purple-500/40"
              />
            </div>
            <div className="w-full md:w-60">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="border-purple-500/20 focus:border-purple-500/40">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {USER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {statusFilter && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Активные фильтры:</span>
              <Badge 
                variant="outline" 
                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
              >
                {statusFilter} <span className="ml-1 cursor-pointer" onClick={() => setStatusFilter(null)}>×</span>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <UsersTable
          users={users}
          isLoading={isLoading}
          currentUserEmail={currentUserEmail}
          onEditUser={handleEditUser}
          onBlockUser={handleBlockUser}
          onDeleteUser={handleDeleteUser}
          onToggleAdmin={handleToggleAdmin}
          isUserAdmin={isUserAdmin}
        />
      </motion.div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_blocked ? "Разблокировать пользователя?" : "Заблокировать пользователя?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.is_blocked
                ? "Пользователь снова сможет войти в систему."
                : "Пользователь не сможет войти в систему, пока не будет разблокирован."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockConfirm}>
              {selectedUser?.is_blocked ? "Разблокировать" : "Заблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все данные пользователя будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isToggleAdminDialogOpen} onOpenChange={setIsToggleAdminDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isUserAdmin(selectedUser?.id || '') 
                ? "Удалить права администратора?" 
                : "Добавить права администратора?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isUserAdmin(selectedUser?.id || '')
                ? "Пользователь потеряет доступ к административной панели."
                : "Пользователь получит доступ к административной панели."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleAdminConfirm}>
              {isUserAdmin(selectedUser?.id || '') ? "Удалить права" : "Добавить права"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTab;
