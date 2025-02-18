
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuyPass = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      // Создаем заявку на оплату сразу при нажатии кнопки
      const { error } = await supabase
        .from('payment_requests')
        .insert([
          {
            user_id: user.id,
            amount: 1000, // Фиксированная стоимость пропуска
            phone_number: "Не указан", // Можно будет обновить позже
            status: 'pending'
          }
        ]);

      if (error) throw error;

      // Уведомляем пользователя
      toast({
        title: "Заявка создана",
        description: "Подойдите к администратору для оплаты пропуска",
      });

      // Перенаправляем на страницу с инструкциями
      navigate("/passes/instructions");
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявку",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            Добро пожаловать в Colizeum
          </h1>
          <p className="text-xl text-foreground/70 mb-8">
            Ваш портал в мир киберспорта и развлечений
          </p>

          <Button 
            onClick={handleBuyPass}
            size="lg"
            className="mb-12"
          >
            Купить пропуск
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Турниры</h2>
              <p className="text-foreground/70">
                Участвуйте в захватывающих турнирах и соревнуйтесь с лучшими игроками
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Сообщество</h2>
              <p className="text-foreground/70">
                Присоединяйтесь к активному сообществу единомышленников
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Награды</h2>
              <p className="text-foreground/70">
                Зарабатывайте очки и получайте эксклюзивные награды
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
