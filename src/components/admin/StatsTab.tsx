
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
  ResponsiveContainer,
  Cell
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
      
      // Safely calculate the total points - use 0 for null points
      const totalPoints = pointsData?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;

      // Получаем среднее количество очков на пользователя
      const avgPoints = usersCount && usersCount > 0 ? Math.round(totalPoints / usersCount) : 0;

      // Get points distribution for chart
      const { data: pointsDistribution } = await supabase
        .from('profiles')
        .select('id, points');
      
      // Create points ranges for chart
      const chartData = createPointsChartData(pointsDistribution || []);

      return {
        usersCount: usersCount || 0,
        passesCount: passesCount || 0,
        totalPoints,
        avgPoints,
        chartData
      };
    }
  });

  // Function to create chart data from points distribution
  const createPointsChartData = (data: { id: string, points: number | null }[]) => {
    const ranges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-500', min: 101, max: 500 },
      { range: '501-1000', min: 501, max: 1000 },
      { range: '1001+', min: 1001, max: Infinity }
    ];
    
    // Initialize counts for each range
    const rangeCounts = ranges.map(range => ({
      name: range.range,
      count: 0
    }));
    
    // Count users in each points range
    data.forEach(user => {
      const points = user.points || 0;
      const rangeIndex = ranges.findIndex(range => 
        points >= range.min && points <= range.max
      );
      
      if (rangeIndex !== -1) {
        rangeCounts[rangeIndex].count += 1;
      }
    });
    
    return rangeCounts;
  };

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

  // Custom colors for the chart bars
  const chartColors = ['#e4d079', '#c8b05c', '#ac914e', '#8c7336'];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-black/80 backdrop-blur-sm border border-[#e4d079]/20 p-3 rounded-md shadow-lg">
          <p className="font-medium text-[#e4d079]">{`${label}`}</p>
          <p className="text-[#e4d079]/80 text-sm">{`${payload[0].name}: ${payload[0].value} пользователей`}</p>
        </div>
      );
    }
    return null;
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

      <Card className="border border-[#e4d079]/10 bg-black/40 backdrop-blur-md shadow-[0_8px_20px_rgba(228,208,121,0.05)]">
        <CardHeader className="border-b border-[#e4d079]/10">
          <CardTitle className="text-[#e4d079]">Статистика очков</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] pt-6">
          {stats?.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                barSize={60}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#333' }} 
                  tick={{ fill: '#e4d079', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={{ stroke: '#333' }} 
                  tick={{ fill: '#e4d079', fontSize: 12 }} 
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(228, 208, 121, 0.1)' }} />
                <Bar 
                  dataKey="count" 
                  name="Пользователей" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity duration-300"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartColors[index % chartColors.length]} 
                      className="hover:filter hover:brightness-110"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                Статистика будет доступна после начисления очков пользователям
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsTab;
