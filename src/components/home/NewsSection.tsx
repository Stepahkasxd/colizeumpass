
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: 'update' | 'event' | 'promo';
  published: boolean;
  created_at: string;
  updated_at: string;
};

const NewsSection = () => {
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);

  // Fetch published news articles
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['public-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as NewsArticle[];
    }
  });

  // Map category to display text
  const getCategoryDisplay = (category: 'update' | 'event' | 'promo') => {
    switch (category) {
      case 'update': return 'Обновление';
      case 'event': return 'Событие';
      case 'promo': return 'Акция';
    }
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Дата не указана";
      }
      return format(date, 'd MMMM', { locale: ru });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Дата не указана";
    }
  };

  // Fallback to sample news if no published news articles yet
  const sampleNewsItems = [
    {
      id: "1",
      title: "Новое оборудование в клубе",
      created_at: "2023-05-15T00:00:00Z",
      summary: "Мы обновили все компьютеры до новейших RTX 4090. Приходите оценить новые возможности!",
      category: "update" as const,
      content: null,
      published: true,
      updated_at: "2023-05-15T00:00:00Z"
    },
    {
      id: "2",
      title: "Турнир по CS2 в эти выходные",
      created_at: "2023-05-12T00:00:00Z",
      summary: "Регистрируйтесь на турнир по CS2. Призовой фонд 50,000 рублей!",
      category: "event" as const,
      content: null,
      published: true,
      updated_at: "2023-05-12T00:00:00Z"
    },
    {
      id: "3",
      title: "Скидка 20% на ночные пропуски",
      created_at: "2023-05-10T00:00:00Z",
      summary: "Только до конца месяца: приобретайте ночные пропуски со скидкой 20%.",
      category: "promo" as const,
      content: null,
      published: true,
      updated_at: "2023-05-10T00:00:00Z"
    }
  ];

  // Use real news or fallback to sample data if no news available
  const displayNews = (newsArticles && newsArticles.length > 0) 
    ? newsArticles 
    : sampleNewsItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7 }}
      className="mt-20 mb-16"
    >
      <div className="flex items-center justify-center mb-8 flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Новости клуба</h2>
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-primary/30 to-primary"></div>
        <p className="text-foreground/70 max-w-2xl mx-auto text-center mt-4">
          Актуальные новости и обновления нашего компьютерного клуба
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
            >
              <Card className="glass-panel border-primary/20 h-full hover:shadow-lg transition-shadow card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{news.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getCategoryDisplay(news.category)}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-foreground/60">
                    {formatDate(news.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{news.summary}</p>
                </CardContent>
                <CardFooter>
                  <button 
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    onClick={() => setSelectedNews(news)}
                  >
                    Подробнее
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* News details dialog */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedNews?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {selectedNews ? formatDate(selectedNews.created_at) : ''}
              </span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                {selectedNews && getCategoryDisplay(selectedNews.category)}
              </span>
            </div>
            <p className="text-foreground/80">{selectedNews?.summary}</p>
            {selectedNews?.content ? (
              <div className="mt-4">
                <p className="whitespace-pre-wrap">{selectedNews.content}</p>
              </div>
            ) : (
              <p className="italic text-muted-foreground">Нет дополнительной информации</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default NewsSection;
