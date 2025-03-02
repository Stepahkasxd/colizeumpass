
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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

  // Fetch initial messages and set up real-time listener
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

    // Set up a single global channel for all messages related to this ticket
    const channelName = `ticket_${ticketId}`;
    console.log(`Setting up real-time subscription for ticket ${ticketId}`);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          console.log('New message received via real-time:', payload);
          
          // Don't process messages that we've already included via optimistic updates
          if (messages.some(m => m.id === payload.new.id || 
              (m.id.startsWith('temp-') && m.message === payload.new.message && m.user_id === payload.new.user_id))) {
            console.log('Message already exists in state, skipping');
            return;
          }
          
          // Check if this is a temporary message we added optimistically
          const isOptimisticUpdate = messages.some(m => 
            m.id.startsWith('temp-') && 
            m.message === payload.new.message && 
            m.user_id === payload.new.user_id
          );
          
          if (isOptimisticUpdate) {
            // Replace the optimistic message with the real one
            setMessages(current => current.map(msg => 
              (msg.id.startsWith('temp-') && 
               msg.message === payload.new.message && 
               msg.user_id === payload.new.user_id) 
                ? { 
                    ...payload.new, 
                    profile: msg.profile 
                  } as Message 
                : msg
            ));
          } else {
            try {
              // Get profile for the user who sent the message
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, display_name')
                .eq('id', payload.new.user_id)
                .single();

              // Add the new message to the state with proper typing
              const newMsg: Message = {
                id: payload.new.id,
                message: payload.new.message,
                user_id: payload.new.user_id,
                created_at: payload.new.created_at,
                ticket_id: payload.new.ticket_id,
                profile: profileData || null
              };

              setMessages(current => [...current, newMsg]);
              
              // When receiving a message from another user, show a toast notification
              if (payload.new.user_id !== user?.id) {
                toast({
                  title: "Новое сообщение",
                  description: `${profileData?.display_name || "Пользователь"}: ${payload.new.message.substring(0, 30)}${payload.new.message.length > 30 ? '...' : ''}`,
                });
              }
            } catch (error) {
              console.error('Error handling real-time message:', error);
            }
          }
          
          // Scroll to bottom when new message arrives
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ticket ${ticketId}:`, status);
      });

    return () => {
      console.log(`Removing channel ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [ticketId, user?.id, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      // Add optimistic update for instant feedback
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        message: newMessage.trim(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        ticket_id: ticketId,
        profile: null // We'll get this from the server
      };
      
      // Get user profile for local optimistic update
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', user.id)
        .single();
        
      if (profileData) {
        optimisticMessage.profile = profileData;
      }
      
      // Apply optimistic update
      setMessages(current => [...current, optimisticMessage]);
      
      // Clear input immediately for better UX
      setNewMessage("");
      
      // Actually send the message
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          message: optimisticMessage.message,
          user_id: user.id,
        });

      if (error) throw error;
      
      // Note: We don't need to add the message here as it will come through the real-time channel
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message if there was an error
      setMessages(current => current.filter(msg => msg.id !== `temp-${Date.now()}`));
      
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение. Попробуйте еще раз.",
        variant: "destructive",
      });
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
};
