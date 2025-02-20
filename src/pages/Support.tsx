
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketChat } from "@/components/support/TicketChat";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { SupportTicket, STATUS_LABELS } from "@/types/support";

const formSchema = z.object({
  subject: z.string().min(5, "Тема должна содержать минимум 5 символов"),
  message: z.string().min(20, "Сообщение должно содержать минимум 20 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Support = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ticketId = searchParams.get('ticket');
    
    if (ticketId && userTickets.length > 0) {
      const ticket = userTickets.find(t => t.id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [userTickets]);

  useEffect(() => {
    if (!user) return;

    const fetchUserTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const typedData = (data || []).map(ticket => ({
          ...ticket,
          status: ticket.status as SupportTicket['status']
        }));
        
        setUserTickets(typedData);
      } catch (error) {
        console.error('Error fetching user tickets:', error);
      }
    };

    fetchUserTickets();

    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Ticket change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // For new tickets, preserve all properties
            const newTicket: SupportTicket = {
              ...payload.new,
              status: payload.new.status as SupportTicket['status'],
              subject: payload.new.subject,
              message: payload.new.message,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              user_id: payload.new.user_id,
              assigned_to: payload.new.assigned_to
            };
            setUserTickets(current => [newTicket, ...current]);
          } 
          else if (payload.eventType === 'UPDATE') {
            // For updates, preserve all properties
            const updatedTicket: SupportTicket = {
              ...payload.new,
              status: payload.new.status as SupportTicket['status'],
              subject: payload.new.subject,
              message: payload.new.message,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              user_id: payload.new.user_id,
              assigned_to: payload.new.assigned_to
            };
            
            setUserTickets(current =>
              current.map(ticket =>
                ticket.id === updatedTicket.id ? updatedTicket : ticket
              )
            );
            
            if (selectedTicket?.id === updatedTicket.id) {
              setSelectedTicket(updatedTicket);
            }
          } 
          else if (payload.eventType === 'DELETE') {
            setUserTickets(current =>
              current.filter(ticket => ticket.id !== payload.old.id)
            );
            
            if (selectedTicket?.id === payload.old.id) {
              handleTicketClose();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedTicket?.id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Необходима авторизация",
          description: "Пожалуйста, войдите в систему чтобы отправить обращение",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error, data } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: values.subject,
          message: values.message,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'user',
        action: 'create_support_ticket',
        details: {
          ticket_id: data.id,
          subject: values.subject
        }
      });

      toast({
        title: "Обращение отправлено",
        description: "Мы ответим вам в ближайшее время",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить обращение. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('ticket', ticket.id);
    window.history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
  };

  const handleTicketClose = () => {
    setSelectedTicket(null);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('ticket');
    window.history.pushState(null, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 rounded-lg"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-glow">
            Техническая поддержка
          </h1>
          
          {userTickets.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Ваши обращения</h2>
              <div className="space-y-4">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          Создан: {format(new Date(ticket.created_at), "dd MMMM yyyy HH:mm", { locale: ru })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ticket.status === 'open' ? 'secondary' : 'default'}>
                          {STATUS_LABELS[ticket.status]}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTicketSelect(ticket)}
                        >
                          Открыть чат
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            {userTickets.length > 0 && (
              <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-background to-transparent" />
            )}
            <div>
              <h2 className="text-xl font-semibold mb-4">Новое обращение</h2>
              <p className="text-foreground/70 mb-6">
                Если у вас возникли вопросы или предложения, напишите нам. Мы ответим в ближайшее время.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тема обращения</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Например: Вопрос по пропуску"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сообщение</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Опишите ваш вопрос подробнее..."
                            className="min-h-[150px] resize-none"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Отправить
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={() => handleTicketClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <>
              <div className="flex items-center justify-between">
                <Badge variant={selectedTicket.status === 'open' ? 'secondary' : 'default'}>
                  {STATUS_LABELS[selectedTicket.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedTicket.created_at), "dd MMMM yyyy HH:mm", { locale: ru })}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Ваше сообщение:</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              {selectedTicket.status !== 'open' && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Чат с поддержкой:</h4>
                  <TicketChat ticketId={selectedTicket.id} />
                </div>
              )}
              {selectedTicket.status === 'open' && (
                <div className="mt-6 text-center text-muted-foreground">
                  Ожидайте, пока администратор возьмет ваш тикет в работу
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
