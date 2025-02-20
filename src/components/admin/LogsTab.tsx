
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type LogCategory = Database['public']['Enums']['log_category'];

type ActivityLog = {
  id: string;
  created_at: string;
  user_id: string;
  category: LogCategory;
  action: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  profiles?: {
    display_name: string | null;
  } | null;
};

const categoryColors = {
  auth: "blue",
  admin: "red",
  points: "green",
  rewards: "yellow",
  shop: "purple",
  passes: "orange",
  user: "pink",
  system: "gray"
} as const;

const categoryLabels = {
  auth: "Авторизация",
  admin: "Админ",
  points: "Очки",
  rewards: "Награды",
  shop: "Магазин",
  passes: "Пропуска",
  user: "Пользователь",
  system: "Система"
} as const;

const LogsTab = () => {
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs', selectedCategory],
    queryFn: async () => {
      const query = supabase
        .from('activity_logs')
        .select('*, profiles!activity_logs_user_id_fkey (display_name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedCategory !== 'all') {
        query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ActivityLog[];
    }
  });

  if (isLoading) {
    return <div>Загрузка логов...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Логи активности</h2>
        <Select
          value={selectedCategory}
          onValueChange={(value: LogCategory | 'all') => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value as LogCategory}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryColors[log.category] as any}>
                      {categoryLabels[log.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.profiles?.display_name || 'Неизвестный пользователь'}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsTab;
