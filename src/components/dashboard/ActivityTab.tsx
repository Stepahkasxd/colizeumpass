
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { History, Calendar, Star, Ticket, Clock, Award } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Define activity types
type Activity = {
  id: string;
  type: 'reward' | 'purchase' | 'level_up' | 'login' | 'points';
  description: string;
  created_at: string;
  points?: number;
  details?: Record<string, any>;
};

export const ActivityTab = () => {
  const { user } = useAuth();

  // In a real app, we would fetch this from the backend
  // For now, we'll create mock data for demonstration
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['user-activities', user?.id],
    queryFn: async () => {
      // Mock data for demo purposes
      // In production, replace with actual API call
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'login',
          description: 'Вход в систему',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
        },
        {
          id: '2',
          type: 'points',
          description: 'Начисление очков',
          points: 100,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'level_up',
          description: 'Повышение уровня до 2',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '4',
          type: 'reward',
          description: 'Получена награда "Стартовый бонус"',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        },
        {
          id: '5',
          type: 'purchase',
          description: 'Приобретен пропуск "Стандартный"',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          details: {
            price: 500,
            pass_name: 'Стандартный'
          }
        },
        {
          id: '6',
          type: 'points',
          description: 'Начисление очков за активность',
          points: 50,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        },
        {
          id: '7',
          type: 'login',
          description: 'Первый вход в систему',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
        },
      ];

      // Sort by date, most recent first
      return mockActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user?.id
  });

  // Function to format date in a human-readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} мин. назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return format(date, 'dd.MM.yyyy');
    }
  };

  // Function to get icon for activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'reward':
        return <Award className="h-4 w-4 text-purple-400" />;
      case 'purchase':
        return <Ticket className="h-4 w-4 text-blue-400" />;
      case 'level_up':
        return <Star className="h-4 w-4 text-orange-400" />;
      case 'points':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'login':
      default:
        return <History className="h-4 w-4 text-green-400" />;
    }
  };

  // Function to get badge color for activity type
  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'reward':
        return <Badge variant="outline" className="border-purple-500/30 text-purple-300">Награда</Badge>;
      case 'purchase':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-300">Покупка</Badge>;
      case 'level_up':
        return <Badge variant="outline" className="border-orange-500/30 text-orange-300">Уровень</Badge>;
      case 'points':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">Очки</Badge>;
      case 'login':
      default:
        return <Badge variant="outline" className="border-green-500/30 text-green-300">Вход</Badge>;
    }
  };

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
            История активности
          </CardTitle>
          <CardDescription>
            Последние действия и события в вашем аккаунте
          </CardDescription>
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
                {activities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-black/40">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        {getActivityBadge(activity.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{activity.description}</span>
                        {activity.points && (
                          <span className="text-xs text-yellow-400/70">+{activity.points} очков</span>
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
