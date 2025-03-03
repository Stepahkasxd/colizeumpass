
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Award, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";

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
      description: "Всего забранных наград"
    }
  ];

  // Sample data for activity chart
  const activityData = [
    { month: 'Янв', points: 400 },
    { month: 'Фев', points: 300 },
    { month: 'Мар', points: 500 },
    { month: 'Апр', points: 280 },
    { month: 'Май', points: 590 },
    { month: 'Июн', points: 800 }
  ];

  // Data for progress pie chart
  const nextLevelPoints = (stats?.level || 1) * 1000;
  const currentPoints = stats?.points || 0;
  const pointsToNextLevel = Math.max(nextLevelPoints - currentPoints, 0);
  const progressData = [
    { name: 'Прогресс', value: currentPoints },
    { name: 'Осталось', value: pointsToNextLevel }
  ];
  const COLORS = ['#e4d079', '#303030'];

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
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Прогресс до следующего уровня */}
        <motion.div 
          variants={itemVariants}
          className="h-full"
        >
          <Card className="dashboard-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 dashboard-icon" />
                Прогресс до уровня {(stats?.level || 1) + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} очков`, '']}
                      contentStyle={{ background: 'rgba(0, 0, 0, 0.8)', borderRadius: '4px', border: 'none' }}
                    />
                    <Legend 
                      payload={[
                        { value: 'Набрано очков', type: 'circle', color: COLORS[0] },
                        { value: 'Осталось до следующего уровня', type: 'circle', color: COLORS[1] }
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Набрано <span className="font-bold text-[#e4d079]">{currentPoints}</span> из <span className="font-bold">{nextLevelPoints}</span> очков
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Осталось набрать: <span className="font-bold">{pointsToNextLevel}</span> очков
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* График активности */}
        <motion.div 
          variants={itemVariants}
          className="h-full"
        >
          <Card className="dashboard-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 dashboard-icon" />
                Активность по месяцам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} очков`, 'Набрано']}
                      contentStyle={{ background: 'rgba(0, 0, 0, 0.8)', borderRadius: '4px', border: 'none' }}
                    />
                    <Bar dataKey="points" fill="#e4d079" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
