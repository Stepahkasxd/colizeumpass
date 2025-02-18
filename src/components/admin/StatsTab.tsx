
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const StatsTab = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Получаем общее количество пользователей
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Получаем количество выданных пропусков
      const { count: passesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('has_pass', true);

      // Получаем сумму всех очков пользователей
      const { data: pointsData } = await supabase
        .from('profiles')
        .select('points');
      
      const totalPoints = pointsData?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;

      // Получаем среднее количество очков на пользователя
      const avgPoints = usersCount ? Math.round(totalPoints / usersCount) : 0;

      return {
        usersCount: usersCount || 0,
        passesCount: passesCount || 0,
        totalPoints,
        avgPoints
      };
    }
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (isLoading) {
    return <div>Загрузка статистики...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Пользователи
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.usersCount}</div>
              <p className="text-xs text-muted-foreground">
                Зарегистрированных пользователей
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Прогресс
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgPoints}</div>
              <p className="text-xs text-muted-foreground">
                Среднее количество очков
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Награды
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Всего заработано очков
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Пропуска
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.passesCount}</div>
              <p className="text-xs text-muted-foreground">
                Активных пропусков
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {stats?.totalPoints > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Статистика очков</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground text-center">
              Статистика будет доступна после начисления очков пользователям
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsTab;
