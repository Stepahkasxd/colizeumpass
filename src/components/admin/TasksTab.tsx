
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for different notification items
type PaymentRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  amount: number;
  pass_id: string | null;
  passes?: {
    name: string;
  } | null;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  user_id: string;
};

type NotificationFilter = 'all' | 'payments' | 'tickets';

const TasksTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  // Fetch payment requests
  const { data: payments = [] } = useQuery({
    queryKey: ['payment_requests_pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*, passes(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentRequest[];
    }
  });

  // Fetch open support tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['support_tickets_open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('status', 'open')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNavigateToPayments = () => {
    navigate("/admin?tab=payments");
  };

  const handleNavigateToSupport = () => {
    navigate("/admin?tab=support");
  };

  // Filter notifications based on selected type
  const filteredNotifications = () => {
    switch (filter) {
      case 'payments':
        return payments.map(payment => ({
          type: 'payment',
          data: payment
        }));
      case 'tickets':
        return tickets.map(ticket => ({
          type: 'ticket',
          data: ticket
        }));
      case 'all':
      default:
        return [
          ...payments.map(payment => ({ type: 'payment', data: payment })),
          ...tickets.map(ticket => ({ type: 'ticket', data: ticket }))
        ].sort((a, b) => 
          new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
        );
    }
  };

  const totalNotifications = payments.length + tickets.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Дела и уведомления</h2>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationFilter)}>
            <TabsList>
              <TabsTrigger value="all">
                Все
                {totalNotifications > 0 && (
                  <Badge variant="secondary" className="ml-2">{totalNotifications}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payments">
                Платежи
                {payments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{payments.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tickets">
                Запросы
                {tickets.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{tickets.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {totalNotifications === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Нет активных уведомлений
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications().map((notification, index) => {
            if (notification.type === 'payment') {
              const payment = notification.data as PaymentRequest;
              return (
                <Card key={`payment-${payment.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-base">Заявка на оплату</CardTitle>
                      </div>
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                        Ожидает оплаты
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium">{payment.passes?.name || 'Пропуск'}</p>
                      <p className="text-muted-foreground">Сумма: {formatAmount(payment.amount)}</p>
                      <p className="text-muted-foreground mb-3">Дата: {formatDate(payment.created_at)}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNavigateToPayments}
                        className="w-full"
                      >
                        Обработать заявку
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            } else if (notification.type === 'ticket') {
              const ticket = notification.data as SupportTicket;
              return (
                <Card key={`ticket-${ticket.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-base">Новый тикет в поддержку</CardTitle>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        Открыт
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-muted-foreground">ID пользователя: {ticket.user_id}</p>
                      <p className="text-muted-foreground mb-3">Дата: {formatDate(ticket.created_at)}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNavigateToSupport}
                        className="w-full"
                      >
                        Ответить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default TasksTab;
