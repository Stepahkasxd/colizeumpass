
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

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
  const [page, setPage] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['activity-logs', selectedCategory, page, date],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*, profiles!activity_logs_user_id_fkey (display_name)', { count: 'exact' });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (date?.from) {
        query = query.gte('created_at', date.from.toISOString());
      }

      if (date?.to) {
        query = query.lte('created_at', date.to.toISOString());
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      return {
        logs: data as ActivityLog[],
        totalCount: count || 0
      };
    }
  });

  const totalPages = Math.ceil((logsData?.totalCount || 0) / ITEMS_PER_PAGE);

  const renderDetails = (details: any) => {
    if (!details) return null;

    return (
      <div className="space-y-1">
        {Object.entries(details).map(([key, value]) => {
          if (key === 'changes' && typeof value === 'object') {
            return (
              <div key={key} className="space-y-1">
                {Object.entries(value as any).map(([field, change]) => (
                  <div key={field} className="text-xs">
                    <span className="font-medium">{field}:</span>{' '}
                    {(change as any).from} → {(change as any).to}
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div>Загрузка логов...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Логи активности</h2>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: ru })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: ru })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: ru })
                  )
                ) : (
                  <span>Выберите даты</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

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
              {logsData?.logs.map((log) => (
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
                  <TableCell className="max-w-md">
                    {renderDetails(log.details)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogsTab;
