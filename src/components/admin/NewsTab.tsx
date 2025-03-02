import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle, 
  Clock, 
  Edit, 
  FilePlus, 
  MoreHorizontal, 
  Newspaper, 
  Trash,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";

// Type for news articles
type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: 'update' | 'event' | 'promo';
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string | null;
};

// Form schema for news article
const newsFormSchema = z.object({
  title: z.string().min(3, { message: "Заголовок должен содержать минимум 3 символа" }),
  summary: z.string().min(10, { message: "Краткое описание должно содержать минимум 10 символов" }),
  content: z.string().optional(),
  category: z.enum(['update', 'event', 'promo']),
  published: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

const NewsTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      category: "update",
      published: false,
    },
  });

  // Fetch news articles
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    }
  });

  // Create news article mutation
  const createNewsMutation = useMutation({
    mutationFn: async (values: NewsFormValues) => {
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: values.title,
          summary: values.summary,
          content: values.content || null,
          category: values.category,
          published: values.published,
          author_id: user?.id || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success("Новость успешно создана");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating news article:", error);
      toast.error("Ошибка при создании новости");
    }
  });

  // Update news article mutation
  const updateNewsMutation = useMutation({
    mutationFn: async (values: NewsFormValues & { id: string }) => {
      const { id, ...updateValues } = values;
      const { data, error } = await supabase
        .from('news_articles')
        .update({
          title: updateValues.title,
          summary: updateValues.summary,
          content: updateValues.content || null,
          category: updateValues.category,
          published: updateValues.published
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success("Новость успешно обновлена");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating news article:", error);
      toast.error("Ошибка при обновлении новости");
    }
  });

  // Delete news article mutation
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success("Новость успешно удалена");
    },
    onError: (error) => {
      console.error("Error deleting news article:", error);
      toast.error("Ошибка при удалении новости");
    }
  });

  // Reset form and open dialog
  const handleAddNew = () => {
    setCurrentArticle(null);
    form.reset({
      title: "",
      summary: "",
      content: "",
      category: "update",
      published: false,
    });
    setIsDialogOpen(true);
  };

  // Edit article
  const handleEdit = (article: NewsArticle) => {
    setCurrentArticle(article);
    form.reset({
      title: article.title,
      summary: article.summary,
      content: article.content || "",
      category: article.category,
      published: article.published,
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: NewsFormValues) => {
    if (currentArticle) {
      updateNewsMutation.mutate({ ...values, id: currentArticle.id });
    } else {
      createNewsMutation.mutate(values);
    }
  };

  // Map category to display text
  const getCategoryDisplay = (category: 'update' | 'event' | 'promo') => {
    switch (category) {
      case 'update': return 'Обновление';
      case 'event': return 'Событие';
      case 'promo': return 'Акция';
    }
  };

  // Get badge color based on category
  const getCategoryColor = (category: 'update' | 'event' | 'promo') => {
    switch (category) {
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'promo': return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6" />
          Управление новостями
        </h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          Добавить новость
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {newsArticles && newsArticles.length > 0 ? (
            newsArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden border-primary/10">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          {article.published ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Опубликовано
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Черновик
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Badge className={getCategoryColor(article.category)}>
                            {getCategoryDisplay(article.category)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(article)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm("Вы уверены, что хотите удалить эту новость?")) {
                                    deleteNewsMutation.mutate(article.id);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground my-2">{article.summary}</p>
                      <div className="text-xs text-muted-foreground">
                        Создано: {format(new Date(article.created_at), 'dd.MM.yyyy HH:mm')}
                        {article.updated_at !== article.created_at && 
                          ` | Обновлено: ${format(new Date(article.updated_at), 'dd.MM.yyyy HH:mm')}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет новостей</h3>
              <p className="text-muted-foreground">Добавьте первую новость, нажав кнопку "Добавить новость"</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentArticle ? "Редактировать новость" : "Создать новость"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите заголовок" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краткое описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Введите краткое описание новости" 
                        className="resize-none" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Полное содержание (опционально)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Введите полный текст новости" 
                        className="resize-none" 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="update">Обновление</SelectItem>
                          <SelectItem value="event">Событие</SelectItem>
                          <SelectItem value="promo">Акция</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-7">
                      <div className="space-y-0.5">
                        <FormLabel>Опубликовать</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
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
                  <CheckCircle className="h-4 w-4" />
                  {currentArticle ? "Сохранить изменения" : "Создать новость"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsTab;
