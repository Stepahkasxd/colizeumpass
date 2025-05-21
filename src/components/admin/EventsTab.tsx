
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash, 
  Save, 
  X, 
  Star, 
  Award, 
  Check
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Event types and interfaces
type EventType = 'bonus' | 'reward' | 'other';

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  event_date: string;
  created_at: string;
  created_by: string;
}

// Form schema
const eventFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Заголовок должен содержать минимум 3 символа" })
    .max(100, { message: "Заголовок не должен превышать 100 символов" }),
  description: z.string()
    .min(10, { message: "Описание должно содержать минимум 10 символов" })
    .max(500, { message: "Описание не должно превышать 500 символов" }),
  event_type: z.enum(['bonus', 'reward', 'other']),
  event_date: z.string().min(1, { message: "Выберите дату события" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventsTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<UpcomingEvent | null>(null);

  // Form setup
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "other",
      event_date: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upcoming_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching upcoming events:', error);
        throw error;
      }
      
      return (data as UpcomingEvent[]) || [];
    }
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from('upcoming_events')
        .insert({
          title: values.title,
          description: values.description,
          event_type: values.event_type,
          event_date: values.event_date,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Log this admin action
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_category: 'admin',
        p_action: 'Создание события',
        p_details: { 
          event_id: data.id, 
          title: values.title,
          event_type: values.event_type
        }
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-events'] });
      toast.success("Событие успешно создано");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast.error("Ошибка при создании события");
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues & { id: string }) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");
      
      const { id, ...updateValues } = values;
      
      const { data, error } = await supabase
        .from('upcoming_events')
        .update({
          title: updateValues.title,
          description: updateValues.description,
          event_type: updateValues.event_type,
          event_date: updateValues.event_date,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Log this admin action
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_category: 'admin',
        p_action: 'Изменение события',
        p_details: { 
          event_id: id, 
          title: updateValues.title,
          event_type: updateValues.event_type
        }
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-events'] });
      toast.success("Событие успешно обновлено");
      setIsDialogOpen(false);
      setCurrentEvent(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast.error("Ошибка при обновлении события");
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Пользователь не авторизован");
      
      const { error } = await supabase
        .from('upcoming_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log this admin action
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_category: 'admin',
        p_action: 'Удаление события',
        p_details: { event_id: id }
      });
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-upcoming-events'] });
      toast.success("Событие успешно удалено");
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast.error("Ошибка при удалении события");
    }
  });

  // Open dialog for new event
  const handleAddNew = () => {
    setCurrentEvent(null);
    form.reset({
      title: "",
      description: "",
      event_type: "other",
      event_date: new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  // Open dialog to edit event
  const handleEdit = (event: UpcomingEvent) => {
    setCurrentEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      event_date: new Date(event.event_date).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  // Form submission handler
  const onSubmit = (values: EventFormValues) => {
    if (currentEvent) {
      updateEventMutation.mutate({ ...values, id: currentEvent.id });
    } else {
      createEventMutation.mutate(values);
    }
  };

  // Helper to display event type
  const getEventTypeDisplay = (type: EventType) => {
    switch (type) {
      case 'bonus': return 'Бонус';
      case 'reward': return 'Награда';
      case 'other': return 'Другое';
    }
  };

  // Helper to get event icon
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'bonus': return <Star className="h-4 w-4" />;
      case 'reward': return <Award className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Helper to format date
  const formatEventDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd.MM.yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Управление предстоящими событиями
        </h2>
        <Button 
          onClick={handleAddNew} 
          variant="default"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Добавить событие
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse text-muted-foreground">Загрузка...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.length > 0 ? (
            events.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {getEventTypeDisplay(event.event_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatEventDate(event.event_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          if(window.confirm('Вы действительно хотите удалить это событие?')) {
                            deleteEventMutation.mutate(event.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-1 lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <CardTitle className="text-xl mb-2">Нет предстоящих событий</CardTitle>
                <CardDescription>
                  Создайте новое событие, которое будет отображаться в личном кабинете пользователей
                </CardDescription>
                <Button 
                  onClick={handleAddNew} 
                  variant="outline" 
                  className="mt-4 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Добавить первое событие
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog for creating/editing events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentEvent ? "Редактировать событие" : "Добавить новое событие"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок события</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите заголовок" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Введите описание события" 
                        className="resize-none" 
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип события</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bonus">Бонус</SelectItem>
                          <SelectItem value="reward">Награда</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дата события</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Отмена
                </Button>
                <Button type="submit" className="gap-1">
                  <Save className="h-4 w-4" />
                  {currentEvent ? "Сохранить" : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTab;
