
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

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

  // Fallback to sample news if no published news articles yet
  const sampleNewsItems = [
    {
      id: "1",
      title: "Новое оборудование в клубе",
      created_at: "2023-05-15T00:00:00Z",
      summary: "Мы обновили все компьютеры до новейших RTX 4090. Приходите оценить новые возможности!",
      category: "update" as const
    },
    {
      id: "2",
      title: "Турнир по CS2 в эти выходные",
      created_at: "2023-05-12T00:00:00Z",
      summary: "Регистрируйтесь на турнир по CS2. Призовой фонд 50,000 рублей!",
      category: "event" as const
    },
    {
      id: "3",
      title: "Скидка 20% на ночные пропуски",
      created_at: "2023-05-10T00:00:00Z",
      summary: "Только до конца месяца: приобретайте ночные пропуски со скидкой 20%.",
      category: "promo" as const
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
                    {format(new Date(news.created_at), 'dd MMMM yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{news.summary}</p>
                </CardContent>
                <CardFooter>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    Подробнее
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default NewsSection;
