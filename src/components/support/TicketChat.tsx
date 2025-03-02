
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Profile {
  display_name: string | null;
}

interface Message {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  ticket_id: string;
  profile: Profile | null;
}

interface TicketChatProps {
  ticketId: string;
  isAdmin?: boolean;
}

export const TicketChat = ({ ticketId, isAdmin }: TicketChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!ticketId) return;

    const fetchMessages = async () => {
      try {
        // Get messages
        const { data: messageData, error: messageError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (messageError) {
          console.error('Error fetching messages:', messageError);
          return;
        }

        // Get profiles for all users
        const userIds = [...new Set(messageData?.map(m => m.user_id) || [])];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Create profiles map
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, Profile>);

        // Combine data
        const combinedMessages = (messageData || []).map(message => ({
          ...message,
          profile: profilesMap[message.user_id] || null
        }));

        setMessages(combinedMessages);
        
        // Scroll to bottom after messages are loaded
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };

    fetchMessages();

    // Subscribe to new messages using a more specific channel name
    const channel = supabase
      .channel(`ticket_messages_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          try {
            console.log('New message received:', payload);
            
            // Get profile for new message
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name')
              .eq('id', payload.new.user_id)
              .single();

            // Create complete Message object
            const newMessage: Message = {
              id: payload.new.id,
              message: payload.new.message,
              user_id: payload.new.user_id,
              created_at: payload.new.created_at,
              ticket_id: payload.new.ticket_id,
              profile: profileData || null
            };

            setMessages(current => [...current, newMessage]);
            
            // Scroll to bottom when new message arrives
            setTimeout(scrollToBottom, 100);
          } catch (error) {
            console.error('Error handling new message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                  {message.profile?.display_name || "Пользователь"}
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
            onKeyDown={handleKeyPress}
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
