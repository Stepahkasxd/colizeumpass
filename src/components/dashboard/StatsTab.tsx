
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const StatsTab = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Получаем количество полученных наград
      const rewards = profile.rewards as Array<{ id: string }> || [];
      const rewardsCount = rewards.length;

      return {
        level: profile.level || 1,
        points: profile.points || 0,
        status: profile.status || "Стандарт",
        rewardsCount
      };
    },
    enabled: !!user?.id
  });

  const statCards = [
    {
      title: "Уровень",
      value: stats?.level || 1,
      icon: Trophy,
      description: "Текущий уровень"
    },
    {
      title: "Очки",
      value: stats?.points || 0,
      icon: Star,
      description: "Накопленные очки"
    },
    {
      title: "Статус",
      value: stats?.status || "Стандарт",
      icon: Target,
      description: "Ваш статус"
    },
    {
      title: "Награды",
      value: stats?.rewardsCount || 0,
      icon: Award,
      description: "Полученные награды"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
