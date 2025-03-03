
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, Ticket, BarChart3, PercentCircle, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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

      // Получаем топ-5 пользователей по очкам
      const { data: topUsers } = await supabase
        .from('profiles')
        .select('id, display_name, points, created_at')
        .order('points', { ascending: false })
        .limit(5);

      // Получаем процент конверсии (пользователи с пропусками)
      const conversionRate = usersCount && usersCount > 0 
        ? Math.round((passesCount || 0) / usersCount * 100) 
        : 0;

      // Получаем данные для графика активности по регистрации пользователей
      const { data: userRegistrations } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      const activityData = createUserActivityChart(userRegistrations || []);

      return {
        usersCount: usersCount || 0,
        passesCount: passesCount || 0,
        totalPoints,
        avgPoints,
        chartData,
        topUsers: topUsers || [],
        conversionRate,
        activityData
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

  // Function to create user activity chart data
  const createUserActivityChart = (userData: { created_at: string }[]) => {
    if (!userData.length) return [];

    // Group users by month
    const usersByMonth: Record<string, number> = {};
    
    userData.forEach(user => {
      const date = new Date(user.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!usersByMonth[monthYear]) {
        usersByMonth[monthYear] = 0;
      }
      
      usersByMonth[monthYear]++;
    });

    // Convert to chart data
    return Object.entries(usersByMonth).map(([month, count]) => ({
      month,
      users: count
    }));
  };

  // Create data for the conversion pie chart
  const createConversionPieData = (usersCount: number, passesCount: number) => {
    const withoutPass = usersCount - passesCount;
    return [
      { name: 'С пропуском', value: passesCount, fill: '#e4d079' },
      { name: 'Без пропуска', value: withoutPass, fill: '#333' }
    ];
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

  const ActivityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-black/80 backdrop-blur-sm border border-[#e4d079]/20 p-3 rounded-md shadow-lg">
          <p className="font-medium text-[#e4d079]">{`${label}`}</p>
          <p className="text-[#e4d079]/80 text-sm">{`Новых пользователей: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const ConversionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-black/80 backdrop-blur-sm border border-[#e4d079]/20 p-3 rounded-md shadow-lg">
          <p className="font-medium text-[#e4d079]">{`${payload[0].name}`}</p>
          <p className="text-[#e4d079]/80 text-sm">{`${payload[0].value} пользователей (${Math.round(payload[0].value / (stats?.usersCount || 1) * 100)}%)`}</p>
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
                Среднее число забранных наград
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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

        <Card className="border border-[#e4d079]/10 bg-black/40 backdrop-blur-md shadow-[0_8px_20px_rgba(228,208,121,0.05)]">
          <CardHeader className="border-b border-[#e4d079]/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#e4d079]">Активность пользователей</CardTitle>
              <BarChart3 className="h-4 w-4 text-[#e4d079]" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            {stats?.activityData && stats.activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.activityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={{ stroke: '#333' }} 
                    tick={{ fill: '#e4d079', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={{ stroke: '#333' }} 
                    tick={{ fill: '#e4d079', fontSize: 12 }} 
                    width={30}
                  />
                  <Tooltip content={<ActivityTooltip />} cursor={{ stroke: 'rgba(228, 208, 121, 0.3)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#e4d079" 
                    strokeWidth={2}
                    dot={{ fill: '#e4d079', r: 4 }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#e4d079' }}
                    name="Новых пользователей"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Недостаточно данных для отображения активности
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border border-[#e4d079]/10 bg-black/40 backdrop-blur-md shadow-[0_8px_20px_rgba(228,208,121,0.05)]">
          <CardHeader className="border-b border-[#e4d079]/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#e4d079]">Топ пользователей</CardTitle>
              <Award className="h-4 w-4 text-[#e4d079]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {stats?.topUsers && stats.topUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-[#e4d079]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e4d079] to-[#8c7336] flex items-center justify-center text-black font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#e4d079]">{user.display_name || 'Пользователь'}</p>
                        <p className="text-xs text-[#e4d079]/60">
                          Зарегистрирован {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ru })}
                        </p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-[#e4d079]">{user.points || 0} <span className="text-xs">очков</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground text-center">
                  Нет данных о пользователях с очками
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#e4d079]/10 bg-black/40 backdrop-blur-md shadow-[0_8px_20px_rgba(228,208,121,0.05)]">
          <CardHeader className="border-b border-[#e4d079]/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#e4d079]">Конверсия пропусков</CardTitle>
              <PercentCircle className="h-4 w-4 text-[#e4d079]" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            {stats && stats.usersCount > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={createConversionPieData(stats.usersCount, stats.passesCount)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                      />
                      <Tooltip content={<ConversionTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-[#e4d079]">{stats.conversionRate}%</div>
                  <p className="text-sm text-[#e4d079]/60">пользователей приобрели пропуска</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Недостаточно данных для отображения конверсии
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsTab;
