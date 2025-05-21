
import { Award, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  event_type: 'bonus' | 'reward' | 'other';
  event_date: string;
}

export const UpcomingEvents = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upcoming_events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(5);
      
      if (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }
      
      return data as UpcomingEvent[] || [];
    }
  });

  // Default events if none in database
  const displayEvents = events.length > 0 ? events : [
    {
      id: '1',
      title: 'Бонусные очки',
      description: 'Через 2 дня вы получите ежемесячный бонус в 100 очков',
      event_type: 'bonus' as const,
      event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days from now
    },
    {
      id: '2',
      title: 'Награда за уровень',
      description: 'До следующей награды осталось набрать 150 очков',
      event_type: 'reward' as const,
      event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days from now
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Star className="h-4 w-4 text-primary" />;
      case 'reward':
        return <Award className="h-4 w-4 text-primary" />;
      default:
        return <Calendar className="h-4 w-4 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="dashboard-card border border-primary/10 bg-black/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 bg-black/30">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="h-5 w-5 text-primary" />
            Ближайшие события
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse text-muted-foreground">Загрузка...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="dashboard-card border border-primary/10 bg-black/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 bg-black/30">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="h-5 w-5 text-primary" />
            Ближайшие события
          </CardTitle>
          <CardDescription className="text-gray-300">
            Анонсы предстоящих событий и начислений
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center space-x-4 rounded-md border border-primary/10 p-3 bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-200">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
