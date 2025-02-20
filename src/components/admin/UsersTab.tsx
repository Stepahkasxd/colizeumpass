import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
import { UserProfile, Reward } from "@/types/user";
import { UsersTable } from "./users/UsersTable";
import { EditUserForm } from "./users/EditUserForm";

const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleAdminDialogOpen, setIsToggleAdminDialogOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);

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
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*');

      if (searchTerm) {
        query = query.or(`phone_number.ilike.%${searchTerm}%,id.eq.${searchTerm}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(profile => ({
        ...profile,
        rewards: Array.isArray(profile.rewards) ? profile.rewards as Reward[] : [],
        free_points: typeof profile.free_points === 'number' ? profile.free_points : 0,
        status: profile.status || 'Standard'
      })) as UserProfile[];
    }
  });

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
        // Удаляем права администратора
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        // Добавляем права администратора
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.id,
            role: 'admin'
          });

        if (error) throw error;
      }

      // Обновляем список администраторов
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

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по ID или номеру телефона..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onClose={() => setIsEditDialogOpen(false)}
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
