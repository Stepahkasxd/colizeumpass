import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBuyPass = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в систему для покупки пропуска",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.phone_number) {
        toast({
          title: "Ошибка",
          description: "Необходимо указать номер телефона в профиле",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('payment_requests')
        .insert([
          {
            user_id: user.id,
            amount: 1000,
            phone_number: profile.phone_number,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Заявка создана",
        description: "Подойдите к администратору для оплаты пропуска",
      });

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
    <>
      <div className="flex justify-center mb-6">
        <motion.div 
          className="inline-flex items-center px-4 py-2 rounded-full glass-panel text-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Star className="w-4 h-4 text-yellow-400 mr-2" />
          <span>Добро пожаловать в компьютерный клуб нового поколения</span>
        </motion.div>
      </div>

      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-6 text-with-shadow"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        Добро пожаловать в <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e4d079] to-[#ffebb3]">Colizeum</span> на Родине
      </motion.h1>

      <motion.p 
        className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        Ваш персональный пропуск с наградами, который сделает время проведенное в нашем клубе немного приятнее )
      </motion.p>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Button 
          onClick={handleBuyPass}
          size="lg"
          className="gap-2 relative overflow-hidden group"
        >
          <span className="relative z-10">Купить пропуск</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate("/support")}
          className="border-primary/20 hover:border-primary/40 transition-colors"
        >
          Техническая поддержка
        </Button>
      </motion.div>
    </>
  );
};

export default HeroSection;
