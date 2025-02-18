
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PassList } from "./passes/PassList";
import { PassForm } from "./passes/PassForm";

export type Pass = {
  id: string;
  name: string;
  description: string | null;
  levels: {
    level: number;
    points_required: number;
    reward: {
      name: string;
      description: string;
    };
  }[];
  created_at: string;
};

const PassesTab = () => {
  const { toast } = useToast();
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
        levels: pass.levels || [],
        created_at: pass.created_at
      })) as Pass[];
    }
  });

  const handleCreatePass = async (data: Omit<Pass, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('passes')
        .insert([{
          name: data.name,
          description: data.description,
          levels: data.levels || []
        }]);

      if (error) throw error;

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

  const handleEditPass = async (data: Omit<Pass, 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('passes')
        .update({
          name: data.name,
          description: data.description,
          levels: data.levels || []
        })
        .eq('id', data.id);

      if (error) throw error;

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
    try {
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Пропуск успешно удален",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пропуск",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Управление пропусками</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать пропуск
        </Button>
      </div>

      <PassList
        passes={passes}
        isLoading={isLoading}
        onEdit={setEditingPass}
        onDelete={handleDeletePass}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Создать пропуск</DialogTitle>
          </DialogHeader>
          <PassForm
            onSubmit={handleCreatePass}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPass} onOpenChange={() => setEditingPass(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать пропуск</DialogTitle>
          </DialogHeader>
          {editingPass && (
            <PassForm
              initialData={editingPass}
              onSubmit={handleEditPass}
              onCancel={() => setEditingPass(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PassesTab;
