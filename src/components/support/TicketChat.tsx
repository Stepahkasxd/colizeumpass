
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type DatabaseMessage = {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
  } | null;
};

interface TicketChatProps {
  ticketId: string;
  isAdmin?: boolean;
}

export const TicketChat = ({ ticketId, isAdmin }: TicketChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          id,
          message,
          user_id,
          created_at,
          profiles:user_id (
            display_name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`ticket_messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          const { data: messageData, error } = await supabase
            .from('ticket_messages')
            .select(`
              id,
              message,
              user_id,
              created_at,
              profiles:user_id (
                display_name
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }

          if (messageData) {
            setMessages(current => [...current, messageData]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          message: newMessage.trim(),
          user_id: user.id,
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: ru });
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col p-3 rounded-lg",
                message.user_id === user?.id
                  ? "ml-auto bg-primary/10 max-w-[80%]"
                  : "mr-auto bg-muted max-w-[80%]"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {message.profiles?.display_name || "Пользователь"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(message.created_at)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
};
