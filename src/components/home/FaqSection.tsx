
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.7 }}
      className="mt-20 mb-16"
    >
      <div className="flex items-center justify-center mb-8 flex-col">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Часто задаваемые вопросы</h2>
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-primary/30 to-primary"></div>
        <p className="text-foreground/70 max-w-2xl mx-auto text-center mt-4">
          Ответы на популярные вопросы о нашем компьютерном клубе и системе пропусков
        </p>
      </div>
      
      <Card className="glass-panel border-primary/20 max-w-3xl mx-auto shadow-lg">
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-2" className="border-b border-primary/10">
              <AccordionTrigger className="text-lg hover:text-primary transition-colors py-4">
                Как купить пропуск?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 pb-4">
                Для покупки пропуска нажмите кнопку "Купить пропуск" на главной странице, 
                затем подойдите к администратору клуба для оплаты. После подтверждения оплаты 
                пропуск будет автоматически добавлен в ваш личный кабинет.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-b border-primary/10">
              <AccordionTrigger className="text-lg hover:text-primary transition-colors py-4">
                Каковы преимущества разных уровней пропуска?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 pb-4">
                Каждый уровень пропуска предоставляет уникальные бонусы и привилегии. 
                Начальные уровни дают базовые преимущества, такие как скидки на время игры. 
                Более высокие уровни могут включать приоритетную бронь, бесплатные часы игры, 
                и эксклюзивный доступ к мероприятиям и турнирам.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border-b border-primary/10">
              <AccordionTrigger className="text-lg hover:text-primary transition-colors py-4">
                Как повысить уровень пропуска?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 pb-4">
                Уровень пропуска повышается автоматически по мере накопления игровых часов 
                и баллов лояльности. Каждый час, проведенный в клубе, приближает вас к 
                следующему уровню. Вы можете отслеживать прогресс в своем личном кабинете.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6" className="border-b border-primary/10">
              <AccordionTrigger className="text-lg hover:text-primary transition-colors py-4">
                Можно ли передать пропуск другому человеку?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 pb-4">
                Нет, пропуск является персональным и привязан к вашему аккаунту. 
                Передача пропуска другим пользователям запрещена правилами клуба.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg hover:text-primary transition-colors py-4">
                Что делать, если возникли проблемы с пропуском?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 pb-4">
                В случае возникновения любых проблем с пропуском, обратитесь к администратору клуба 
                или в раздел "Техническая поддержка" на нашем сайте. Наша команда оперативно 
                поможет решить вашу проблему.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FaqSection;
