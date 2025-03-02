
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const NewsSection = () => {
  // Sample news data - this would be replaced with real data later
  const newsItems = [
    {
      id: 1,
      title: "Новое оборудование в клубе",
      date: "15 мая 2023",
      summary: "Мы обновили все компьютеры до новейших RTX 4090. Приходите оценить новые возможности!",
      tag: "Обновление"
    },
    {
      id: 2,
      title: "Турнир по CS2 в эти выходные",
      date: "12 мая 2023",
      summary: "Регистрируйтесь на турнир по CS2. Призовой фонд 50,000 рублей!",
      tag: "Событие"
    },
    {
      id: 3,
      title: "Скидка 20% на ночные пропуски",
      date: "10 мая 2023",
      summary: "Только до конца месяца: приобретайте ночные пропуски со скидкой 20%.",
      tag: "Акция"
    }
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {newsItems.map((news) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 * news.id }}
          >
            <Card className="glass-panel border-primary/20 h-full hover:shadow-lg transition-shadow card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{news.title}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{news.tag}</span>
                </div>
                <CardDescription className="text-xs text-foreground/60">{news.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{news.summary}</p>
              </CardContent>
              <CardFooter>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  Подробнее
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NewsSection;
