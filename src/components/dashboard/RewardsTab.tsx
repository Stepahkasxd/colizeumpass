
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Reward } from "@/types/user";

export const RewardsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rewards')
        .eq('id', user?.id)
        .single();

      return (profile?.rewards || []) as Reward[];
    },
    enabled: !!user?.id
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      // Получаем текущие награды
      const { data: profile } = await supabase
        .from('profiles')
        .select('rewards')
        .eq('id', user?.id)
        .single();
      
      if (!profile?.rewards) throw new Error("Награды не найдены");
      
      // Обновляем статус конкретной награды
      const updatedRewards = (profile.rewards as Reward[]).map(reward => 
        reward.id === rewardId 
          ? { ...reward, status: 'claimed' as const } 
          : reward
      );

      // Сохраняем обновленные награды
      const { error } = await supabase
        .from('profiles')
        .update({ rewards: updatedRewards })
        .eq('id', user?.id);

      if (error) throw error;
      return rewardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast({
        title: "Награда перемещена в историю",
        description: "Для получения подойдите к администратору",
      });
    }
  });

  const handleClaimReward = (rewardId: string) => {
    claimRewardMutation.mutate(rewardId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const availableRewards = rewards.filter(r => r.status === "available");
  const claimedRewards = rewards.filter(r => r.status === "claimed");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Доступные награды</h2>
        <div className="grid gap-4">
          {availableRewards.length > 0 ? (
            availableRewards.map((reward) => (
              <Card key={reward.id} className="relative group overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reward.description && (
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Получено: {new Date(reward.earnedAt).toLocaleDateString()}
                      </div>
                      <Button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={claimRewardMutation.isPending}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Забрать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  У вас пока нет доступных наград
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">История наград</h2>
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-4">
            {claimedRewards.length > 0 ? (
              claimedRewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reward.description && (
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Получено: {new Date(reward.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                История наград пуста
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
