
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/utils/logger";
import { Pass } from "@/components/admin/PassesTab";

export const usePasses = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<Pass | null>(null);

  const { data: passes, isLoading, refetch } = useQuery({
    queryKey: ['passes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]).map(pass => ({
        id: pass.id,
        name: pass.name,
        description: pass.description,
        price: pass.price,
        levels: pass.levels || [],
        created_at: pass.created_at
      })) as Pass[];
    }
  });

  const handleCreatePass = async (data: Omit<Pass, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error, data: newPass } = await supabase
        .from('passes')
        .insert([{
          name: data.name,
          description: data.description,
          price: data.price,
          levels: data.levels || []
        }])
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'passes',
        action: 'create_pass',
        details: {
          pass_id: newPass.id,
          pass_name: data.name,
          price: data.price,
          levels_count: data.levels?.length || 0
        }
      });

      toast({
        title: "Успех",
        description: "Пропуск успешно создан",
      });

      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating pass:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать пропуск",
        variant: "destructive",
      });
    }
  };

  const handleEditPass = async (data: Pass) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('passes')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          levels: data.levels || []
        })
        .eq('id', data.id);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'passes',
        action: 'update_pass',
        details: {
          pass_id: data.id,
          pass_name: data.name,
          changes: {
            name: data.name !== editingPass?.name ? 
              { from: editingPass?.name, to: data.name } : undefined,
            price: data.price !== editingPass?.price ? 
              { from: editingPass?.price, to: data.price } : undefined,
            levels_count: data.levels?.length !== editingPass?.levels?.length ? 
              { from: editingPass?.levels?.length, to: data.levels?.length } : undefined
          }
        }
      });

      toast({
        title: "Успех",
        description: "Пропуск успешно обновлен",
      });

      setEditingPass(null);
      refetch();
    } catch (error) {
      console.error('Error updating pass:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пропуск",
        variant: "destructive",
      });
    }
  };

  const handleDeletePass = async (id: string) => {
    if (!user) return;

    try {
      const passToDelete = passes?.find(p => p.id === id);
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'passes',
        action: 'delete_pass',
        details: {
          pass_id: id,
          pass_name: passToDelete?.name
        }
      });

      toast({
        title: "Успех",
        description: "Пропуск успешно удален",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting pass:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пропуск",
        variant: "destructive",
      });
    }
  };

  return {
    passes,
    isLoading,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingPass,
    setEditingPass,
    handleCreatePass,
    handleEditPass,
    handleDeletePass,
  };
};
