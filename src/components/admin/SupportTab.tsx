import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/utils/logger";
import { TicketChat } from "@/components/support/TicketChat";
import { SupportTicket, STATUS_LABELS } from "@/types/support";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SortOption = 'newest' | 'oldest' | 'status';

const SupportTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showArchived, setShowArchived] = useState(false);

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['support_tickets', showArchived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  const getSortedTickets = (tickets: SupportTicket[]) => {
    const sortedTickets = [...tickets];
    switch (sortBy) {
      case 'newest':
        return sortedTickets.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sortedTickets.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'status':
        return sortedTickets.sort((a, b) => {
          const statusOrder = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        });
      default:
        return sortedTickets;
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    if (!user) return;
    
    try {
      const originalTicket = tickets?.find(t => t.id === ticketId);
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: 'update_ticket_status',
        details: {
          ticket_id: ticketId,
          ticket_subject: originalTicket?.subject,
          status_change: {
            from: originalTicket?.status,
            to: newStatus
          }
        }
      });

      toast({
        title: "Статус обновлен",
        description: "Статус тикета успешно обновлен",
      });

      refetch();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус тикета",
        variant: "destructive",
      });
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_to: user.id,
          status: 'in_progress',
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: 'assign_ticket',
        details: {
          ticket_id: ticketId
        }
      });

      toast({
        title: "Тикет назначен",
        description: "Вы взяли тикет в работу",
      });

      refetch();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось взять тикет в работу",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'text-yellow-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'resolved':
        return 'text-green-500';
      case 'closed':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Тикеты технической поддержки</h2>
        <div className="flex items-center gap-4">
          <Tabs value={showArchived ? "archived" : "active"} onValueChange={(value) => setShowArchived(value === "archived")}>
            <TabsList>
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="archived">Архив</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="status">По статусу</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div>Загрузка тикетов...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {showArchived ? "В архиве нет тикетов" : "Активных тикетов нет"}
        </div>
      ) : (
        <div className="grid gap-4">
          {getSortedTickets(tickets).map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID пользователя: {ticket.user_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Создан: {formatDate(ticket.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    defaultValue={ticket.status}
                    onValueChange={(value) => handleStatusChange(ticket.id, value as SupportTicket['status'])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    Подробнее
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
                {ticket.updated_at !== ticket.created_at && (
                  <span className="text-sm text-muted-foreground">
                    · Обновлен: {formatDate(ticket.updated_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали тикета</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>ID пользователя: {selectedTicket.user_id}</span>
                    <span>·</span>
                    <span>Создан: {formatDate(selectedTicket.created_at)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Первоначальное сообщение:</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Статус:</span>
                    <Select
                      defaultValue={selectedTicket.status}
                      onValueChange={(value) => 
                        handleStatusChange(selectedTicket.id, value as SupportTicket['status'])
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTicket.status === 'open' && (
                    <Button onClick={() => handleAssignTicket(selectedTicket.id)}>
                      Взять в работу
                    </Button>
                  )}
                </div>
                {selectedTicket.status !== 'open' && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Чат с пользователем:</h4>
                    <TicketChat ticketId={selectedTicket.id} isAdmin />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTab;
