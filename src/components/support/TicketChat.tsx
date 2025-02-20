
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { logActivity } from "@/utils/logger";

type Message = {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
};

interface TicketChatProps {
  ticketId: string;
  isAdmin?: boolean;
}

export const TicketChat = ({ ticketId, isAdmin }: TicketChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("ticket_messages")
          .select(`
            id,
            message,
            user_id,
            created_at,
            profiles:user_id (
              display_name
            )
          `)
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            message: msg.message,
            user_id: msg.user_id,
            created_at: msg.created_at,
            profiles: msg.profiles as { display_name: string | null } | null
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить сообщения",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();

    // Подписываемся на новые сообщения
    const channel = supabase
      .channel(`ticket_messages_${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          // Получаем полные данные сообщения вместе с профилем
          const { data: newMessageData, error } = await supabase
            .from("ticket_messages")
            .select(`
              id,
              message,
              user_id,
              created_at,
              profiles:user_id (
                display_name
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (!error && newMessageData) {
            const formattedMessage: Message = {
              id: newMessageData.id,
              message: newMessageData.message,
              user_id: newMessageData.user_id,
              created_at: newMessageData.created_at,
              profiles: newMessageData.profiles as { display_name: string | null } | null
            };
            
            setMessages(prev => [...prev, formattedMessage]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      const { error, data } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: isAdmin ? 'admin' : 'user',
        action: 'send_support_message',
        details: {
          ticket_id: ticketId,
          message_id: data.id
        }
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.user_id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.profiles?.display_name || "Пользователь"}
                  </span>
                  <span className="text-xs opacity-70">
                    {format(new Date(message.created_at), "HH:mm", { locale: ru })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
