
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { UserProfile, Reward } from "@/types/user";
import { UsersTable } from "./users/UsersTable";
import { EditUserForm } from "./users/EditUserForm";

const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
        rewards: (profile.rewards || []) as Reward[],
        free_points: profile.free_points || 0
      })) as UserProfile[];
    }
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
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
        onEditUser={handleEditUser}
      />

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
    </div>
  );
};

export default UsersTab;
