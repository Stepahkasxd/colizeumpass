
import { UserProfile, Reward } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Gift, Award } from "lucide-react";

interface UserRewardsProps {
  user: UserProfile;
}

export function UserRewards({ user }: UserRewardsProps) {
  const rewards = user.rewards || [];
  
  return (
    <Card className="bg-black/40 backdrop-blur-md border border-[#e4d079]/20 rounded-lg transition-all duration-300 hover:shadow-[0_8px_20px_rgba(228,208,121,0.07)]">
      <CardHeader>
        <CardTitle className="text-[#e4d079] flex items-center gap-2">
          <Award className="h-5 w-5 text-[#e4d079]" />
          Награды пользователя
        </CardTitle>
        <CardDescription>
          Список всех наград и достижений пользователя
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward: Reward, index: number) => (
              <div 
                key={reward.id || index} 
                className="p-4 rounded-lg bg-black/30 border border-[#e4d079]/10 flex items-start gap-3"
              >
                <div className="mt-1">
                  <Gift className="h-5 w-5 text-[#e4d079]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-[#e4d079]">{reward.name}</h4>
                    <Badge variant={reward.status === "claimed" ? "default" : "outline"}>
                      {reward.status === "claimed" ? "Получено" : "Доступно"}
                    </Badge>
                  </div>
                  
                  {reward.description && (
                    <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                  )}
                  
                  {reward.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Получено: {format(new Date(reward.earnedAt), "dd.MM.yyyy")}
                    </p>
                  )}
                  
                  {reward.passLevel && (
                    <p className="text-xs mt-1">Уровень пропуска: {reward.passLevel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            У пользователя нет наград
          </div>
        )}
      </CardContent>
    </Card>
  );
}
