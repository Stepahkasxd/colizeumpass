
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type EditUserFormProps = {
  user: {
    id: string;
    points: number;
    free_points: number;
    is_blocked: boolean;
    display_name: string | null;
  };
  onClose: () => void;
};

export const EditUserForm = ({ user, onClose }: EditUserFormProps) => {
  const { user: currentUser } = useAuth();
  const [points, setPoints] = useState(user.points.toString());
  const [freePoints, setFreePoints] = useState(user.free_points.toString());
  const [isBlocked, setIsBlocked] = useState(user.is_blocked);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: {
      points?: number;
      free_points?: number;
      is_blocked?: boolean;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Логируем изменения в activity_logs с детальной информацией
      const logDetails = {
        previous: {
          points: user.points,
          free_points: user.free_points,
          is_blocked: user.is_blocked
        },
        updated: data,
        user_display_name: user.display_name,
        modified_by: currentUser?.id,
        timestamp: new Date().toISOString()
      };

      const { error: logError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: currentUser?.id,
          category: 'admin',
          action: 'update_user',
          details: logDetails,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent
        });

      if (logError) {
        console.error('Error logging activity:', logError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast({
        title: "Успешно",
        description: "Данные пользователя обновлены",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: {
      points?: number;
      free_points?: number;
      is_blocked?: boolean;
    } = {};

    if (points !== user.points.toString()) {
      updates.points = parseInt(points);
    }

    if (freePoints !== user.free_points.toString()) {
      updates.free_points = parseInt(freePoints);
    }

    if (isBlocked !== user.is_blocked) {
      updates.is_blocked = isBlocked;
    }

    if (Object.keys(updates).length > 0) {
      updateUserMutation.mutate(updates);
    } else {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="points">Очки</Label>
        <Input
          id="points"
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="freePoints">Бесплатные очки</Label>
        <Input
          id="freePoints"
          type="number"
          value={freePoints}
          onChange={(e) => setFreePoints(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="blocked"
          checked={isBlocked}
          onCheckedChange={setIsBlocked}
        />
        <Label htmlFor="blocked">Заблокирован</Label>
      </div>

      {isBlocked && (
        <Alert>
          <AlertDescription>
            Заблокированные пользователи не смогут войти в систему
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateUserMutation.isPending}
        >
          Отмена
        </Button>
        <Button 
          type="submit"
          disabled={updateUserMutation.isPending}
        >
          {updateUserMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Сохранить
        </Button>
      </div>
    </form>
  );
};
