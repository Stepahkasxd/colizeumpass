
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Reward } from "@/types/user";
import { Json } from "@/integrations/supabase/types";

// Helper function to safely convert Json to Reward type
const convertToReward = (reward: Json): Reward => {
  // Handle the case when reward is a primitive value (string, number, boolean)
  if (typeof reward !== 'object' || reward === null) {
    return {
      id: crypto.randomUUID(),
      name: 'Unknown Reward',
      status: 'available',
      earnedAt: new Date().toISOString(),
      description: undefined,
      passLevel: undefined
    };
  }
  
  // Now we know reward is an object, extract properties safely
  const rewardObj = reward as Record<string, Json>;
  
  return {
    id: typeof rewardObj.id === 'string' ? rewardObj.id : crypto.randomUUID(),
    name: typeof rewardObj.name === 'string' ? rewardObj.name : 'Unknown Reward',
    status: rewardObj.status === 'claimed' ? 'claimed' : 'available',
    earnedAt: typeof rewardObj.earnedAt === 'string' ? rewardObj.earnedAt : 
              typeof rewardObj.earned_at === 'string' ? rewardObj.earned_at :
              new Date().toISOString(),
    description: typeof rewardObj.description === 'string' ? rewardObj.description : undefined,
    passLevel: typeof rewardObj.passLevel === 'number' ? rewardObj.passLevel : 
               typeof rewardObj.pass_level === 'number' ? rewardObj.pass_level : 
               undefined
  };
};

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

      if (!profile?.rewards || !Array.isArray(profile.rewards)) {
        return [] as Reward[];
      }
      
      return (profile.rewards as Json[]).map(convertToReward);
    },
    enabled: !!user?.id
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rewards')
        .eq('id', user?.id)
        .single();
      
      if (!profile?.rewards) throw new Error("Награды не найдены");
      
      const updatedRewards = (profile.rewards as Json[]).map(reward => {
        const rewardObj = reward as Record<string, Json>;
        if (typeof rewardObj.id === 'string' && rewardObj.id === rewardId) {
          return { ...rewardObj, status: 'claimed' };
        }
        return reward;
      });

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
