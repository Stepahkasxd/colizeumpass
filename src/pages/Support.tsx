import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MessageSquare, Plus } from "lucide-react";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { TicketChat } from "@/components/support/TicketChat";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { SupportTicket, STATUS_LABELS } from "@/types/support";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  subject: z.string().min(5, "Тема должна содержать минимум 5 символов"),
  message: z.string().min(20, "Сообщение должно содержать минимум 20 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Support = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
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
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const typedData = data.map(ticket => ({
          ...ticket,
          status: ticket.status as SupportTicket['status'],
          is_archived: ticket.is_archived || false
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
            const newTicket: SupportTicket = {
              id: payload.new.id,
              subject: payload.new.subject,
              message: payload.new.message,
              status: payload.new.status as SupportTicket['status'],
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              user_id: payload.new.user_id,
              assigned_to: payload.new.assigned_to,
              is_archived: payload.new.is_archived || false
            };
            setUserTickets(current => [newTicket, ...current]);
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedTicket: SupportTicket = {
              id: payload.new.id,
              subject: payload.new.subject,
              message: payload.new.message,
              status: payload.new.status as SupportTicket['status'],
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              user_id: payload.new.user_id,
              assigned_to: payload.new.assigned_to,
              is_archived: payload.new.is_archived || false
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
      setShowNewTicketForm(false);
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

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'closed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e4d079] to-[#ffebb3]">
            Техническая поддержка
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              {userTickets.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Ваши обращения</h2>
                    <Button 
                      onClick={() => setShowNewTicketForm(true)} 
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Новое обращение
                    </Button>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 overflow-hidden">
                    <div className="space-y-0 divide-y divide-primary/10">
                      {userTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={cn(
                            "p-4 transition-colors hover:bg-primary/5 cursor-pointer",
                            selectedTicket?.id === ticket.id && "bg-primary/10"
                          )}
                          onClick={() => handleTicketSelect(ticket)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <MessageSquare className="h-4 w-4 text-primary/70" />
                                <h3 className="font-medium truncate">{ticket.subject}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {ticket.message}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={cn(
                                "text-xs px-2 py-1 rounded-full border",
                                getStatusColor(ticket.status)
                              )}>
                                {STATUS_LABELS[ticket.status]}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(ticket.created_at), "dd MMMM", { locale: ru })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !showNewTicketForm ? (
                <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <h2 className="text-xl font-semibold mb-2">У вас пока нет обращений</h2>
                  <p className="text-muted-foreground mb-6">
                    Создайте новое обращение, если у вас есть вопросы или предложения
                  </p>
                  <Button onClick={() => setShowNewTicketForm(true)}>
                    Создать обращение
                  </Button>
                </div>
              ) : null}

              {showNewTicketForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Новое обращение</h2>
                    {userTickets.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNewTicketForm(false)}
                      >
                        Отмена
                      </Button>
                    )}
                  </div>

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
                                className="bg-black/30"
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
                                className="min-h-[150px] resize-none bg-black/30"
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
                </motion.div>
              )}
            </div>

            <div className="md:col-span-4">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-primary/20 p-6">
                <h3 className="text-lg font-semibold mb-4">Часто задаваемые вопросы</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline">Как купить пропуск?</a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">Как использовать бонусные баллы?</a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">Правила клуба</a>
                  </li>
                </ul>
              </div>
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
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  getStatusColor(selectedTicket.status)
                )}>
                  {STATUS_LABELS[selectedTicket.status]}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedTicket.created_at), "dd MMMM yyyy HH:mm", { locale: ru })}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Ваше сообщение:</h4>
                <p className="text-sm whitespace-pre-wrap bg-black/20 p-3 rounded-md">{selectedTicket.message}</p>
              </div>
              {selectedTicket.status !== 'open' && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Чат с поддержкой:</h4>
                  <TicketChat ticketId={selectedTicket.id} />
                </div>
              )}
              {selectedTicket.status === 'open' && (
                <div className="mt-6 text-center p-4 bg-black/20 rounded-md text-muted-foreground">
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
