
import { useState, useEffect } from "react";
import { UsersTable } from "./users/UsersTable";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Reward } from "@/types/user";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_STATUSES } from "@/types/user";
import { toast } from "sonner";

interface UsersTabProps {
  searchQuery?: string;
}

const UsersTab = ({ searchQuery = "" }: UsersTabProps) => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [passFilter, setPassFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", statusFilter, passFilter, sortBy, sortDirection],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order(sortBy, { ascending: sortDirection === "asc" });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (passFilter === "yes") {
        query = query.eq("has_pass", true);
      } else if (passFilter === "no") {
        query = query.eq("has_pass", false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      return data.map((user) => ({
        ...user,
        rewards: (user.rewards as unknown as Reward[]) || [],
      })) as UserProfile[];
    },
  });

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user.display_name && user.display_name.toLowerCase().includes(query)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(query)) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const handleAddUser = () => {
    console.log("Add user clicked");
  };

  // Use root@root.com for the root user detection
  const currentUserEmail = "root@root.com";
  
  // Function to check admin status
  const isUserAdmin = (userId: string) => {
    // In a real app, this would check against the admin data
    return true;
  };
  
  // Handlers for user actions
  const handleEditUser = (user: UserProfile) => {
    console.log("Edit user:", user);
    toast.info(`Редактирование пользователя ${user.display_name || 'Без имени'}`);
  };
  
  const handleBlockUser = async (user: UserProfile) => {
    try {
      console.log("Block/unblock user:", user);
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
  
  const handleDeleteUser = (user: UserProfile) => {
    console.log("Delete user:", user);
    toast.warning(`Удаление пользователя ${user.display_name || 'Без имени'}`);
  };
  
  const handleToggleAdmin = (user: UserProfile) => {
    console.log("Toggle admin:", user);
    toast.info(`Изменены права администратора для ${user.display_name || 'Без имени'}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select
            value={statusFilter === null ? "all" : statusFilter}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[150px] bg-black/30 border-[#e4d079]/20">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-[#e4d079]/20">
              <SelectItem value="all">Все статусы</SelectItem>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={passFilter === null ? "all" : passFilter}
            onValueChange={(value) => setPassFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[150px] bg-black/30 border-[#e4d079]/20">
              <SelectValue placeholder="Пропуск" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-[#e4d079]/20">
              <SelectItem value="all">Все пользователи</SelectItem>
              <SelectItem value="yes">Имеют пропуск</SelectItem>
              <SelectItem value="no">Без пропуска</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortDirection}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-");
              setSortBy(field);
              setSortDirection(direction as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-[180px] bg-black/30 border-[#e4d079]/20">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-[#e4d079]/20">
              <SelectItem value="created_at-desc">Новые сначала</SelectItem>
              <SelectItem value="created_at-asc">Старые сначала</SelectItem>
              <SelectItem value="display_name-asc">По имени (А-Я)</SelectItem>
              <SelectItem value="display_name-desc">По имени (Я-А)</SelectItem>
              <SelectItem value="points-desc">Больше очков</SelectItem>
              <SelectItem value="points-asc">Меньше очков</SelectItem>
              <SelectItem value="level-desc">Высокий уровень</SelectItem>
              <SelectItem value="level-asc">Низкий уровень</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAddUser}
          className="bg-[#e4d079]/20 hover:bg-[#e4d079]/30 text-[#e4d079]"
        >
          Добавить пользователя
        </Button>
      </div>

      <UsersTable 
        users={filteredUsers} 
        isLoading={isLoading} 
        currentUserEmail={currentUserEmail}
        onEditUser={handleEditUser}
        onBlockUser={handleBlockUser}
        onDeleteUser={handleDeleteUser}
        onToggleAdmin={handleToggleAdmin}
        isUserAdmin={isUserAdmin}
      />
    </div>
  );
};

export default UsersTab;
