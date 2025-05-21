
import { useEffect } from "react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";
import { ActivityItem, Activity } from "./ActivityItem";

export const ActivityList = () => {
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

  return (
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
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
