
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={itemVariants} className="h-full">
          <Card className="dashboard-card h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 dashboard-icon" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-[#e4d079] mb-1">{stat.value}</div>
              <p className="text-xs text-yellow-400/50">
                {stat.description}
              </p>
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#e4d079]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl"></div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
