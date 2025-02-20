
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Award } from "lucide-react";

export const StatsTab = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const statCards = [
    {
      title: "Уровень",
      value: profile?.level || 1,
      icon: Trophy,
      description: "Текущий уровень"
    },
    {
      title: "Очки",
      value: profile?.points || 0,
      icon: Star,
      description: "Накопленные очки"
    },
    {
      title: "Статус",
      value: profile?.status || "Стандарт",
      icon: Target,
      description: "Ваш статус"
    },
    {
      title: "Награды",
      value: "Скоро",
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
