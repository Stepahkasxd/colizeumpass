
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Calendar,
  Star,
  Ticket,
  Clock,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

// Define key activity types
type Activity = {
  id: string;
  category: 'auth' | 'points' | 'rewards' | 'passes' | 'user' | 'system';
  action: string;
  created_at: string;
  details?: Record<string, any>;
};

export const ActivityTab = () => {
  const { user } = useAuth();

  // Log the activity viewing event but only once when component mounts
  useEffect(() => {
    if (user?.id) {
      // Log a simplified activity - just that user viewed their activity
      const logActivity = async () => {
        try {
          const { error } = await supabase.rpc('log_activity', {
            p_user_id: user.id,
            p_category: 'user',
            p_action: 'Просмотр истории',
            p_details: {}
          });
          
          if (error) {
            console.error('Error logging activity view:', error);
          }
        } catch (error) {
          console.error('Error logging activity view:', error);
        }
      };
      
      logActivity();
    }
  }, [user?.id]);

  // Fetch limited activity data - only key actions, not every click
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['user-key-activities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        // Filter to only include important actions, exclude minor interactions
        .or('category.eq.auth,category.eq.rewards,category.eq.passes,category.eq.points')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  // Function to format date in a human-readable way
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  // Function to get icon for activity category
  const getActivityIcon = (category: Activity['category']) => {
    switch (category) {
      case 'rewards':
        return <Award className="h-4 w-4 text-purple-400" />;
      case 'passes':
        return <Ticket className="h-4 w-4 text-blue-400" />;
      case 'points':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'auth':
        return <History className="h-4 w-4 text-green-400" />;
      case 'user':
      case 'system':
      default:
        return <History className="h-4 w-4 text-green-400" />;
    }
  };

  // Function to get badge color for activity category
  const getActivityBadge = (category: Activity['category']) => {
    switch (category) {
      case 'rewards':
        return <Badge variant="outline" className="border-purple-500/30 text-purple-300">Награда</Badge>;
      case 'passes':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-300">Пропуск</Badge>;
      case 'points':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">Очки</Badge>;
      case 'auth':
        return <Badge variant="outline" className="border-green-500/30 text-green-300">Вход</Badge>;
      case 'user':
        return <Badge variant="outline" className="border-teal-500/30 text-teal-300">Действие</Badge>;
      case 'system':
      default:
        return <Badge variant="outline" className="border-gray-500/30 text-gray-300">Система</Badge>;
    }
  };

  // Example activities for when there's no real data yet
  const hasRealData = activities.length > 0;
  const displayActivities = hasRealData ? activities : [
    {
      id: '1',
      category: 'auth' as Activity['category'],
      action: 'Вход в систему',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    },
    {
      id: '2',
      category: 'points' as Activity['category'],
      action: 'Начисление очков',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      details: { points: 100 }
    },
    {
      id: '3',
      category: 'passes' as Activity['category'],
      action: 'Приобретен пропуск "Стандартный"',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      details: {
        price: 500,
        pass_name: 'Стандартный'
      }
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <Card className="dashboard-card overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Основные события
          </CardTitle>
          <CardDescription>
            {hasRealData 
              ? "Ваши важные действия и события в системе" 
              : "Здесь будут отображаться ваши основные события"}
          </CardDescription>
          {!hasRealData && (
            <div className="text-xs text-muted-foreground">
              <p>Пока у вас нет записей активности. Ниже приведены примеры того, как будет выглядеть ваша история активности.</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Тип</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayActivities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-black/40">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.category)}
                        {getActivityBadge(activity.category)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{activity.action}</span>
                        {activity.details?.points && (
                          <span className="text-xs text-yellow-400/70">+{activity.details.points} очков</span>
                        )}
                        {activity.details?.price && (
                          <span className="text-xs text-blue-400/70">{activity.details.price} руб.</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(activity.created_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <motion.div variants={itemVariants}>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Ближайшие события
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Бонусные очки
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Через 2 дня вы получите ежемесячный бонус в 100 очков
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Награда за уровень
                  </p>
                  <p className="text-sm text-muted-foreground">
                    До следующей награды осталось набрать 150 очков
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
