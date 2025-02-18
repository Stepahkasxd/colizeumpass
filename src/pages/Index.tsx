
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, Users, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: passes } = useQuery({
    queryKey: ['passes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

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
    <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            Добро пожаловать в Colizeum на Родине
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Современная система контроля доступа для компьютерного клуба. 
            Покупайте пропуска, получайте бонусы и наслаждайтесь игрой!
          </p>

          {passes && passes.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Доступные пропуска</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {passes.map((pass) => (
                  <motion.div
                    key={pass.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-6 rounded-lg text-left"
                  >
                    <h3 className="text-xl font-semibold mb-2">{pass.name}</h3>
                    <p className="text-foreground/70 mb-4">{pass.description}</p>
                    {pass.levels && pass.levels.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Уровни и награды:</h4>
                        <ul className="list-disc list-inside text-sm text-foreground/70">
                          {pass.levels.map((level: any, index: number) => (
                            <li key={index}>
                              Уровень {level.level}: {level.reward.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={handleBuyPass}
              size="lg"
              className="gap-2"
            >
              Купить пропуск
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/support")}
            >
              Техническая поддержка
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-panel p-6 rounded-lg text-left"
            >
              <div className="mb-4">
                <Clock className="w-10 h-10 text-primary mb-2" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Быстрая покупка</h2>
              <p className="text-foreground/70">
                Мгновенное оформление пропуска через администратора клуба
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-panel p-6 rounded-lg text-left"
            >
              <div className="mb-4">
                <Wallet className="w-10 h-10 text-primary mb-2" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Система лояльности</h2>
              <p className="text-foreground/70">
                Накапливайте баллы за покупки и получайте бонусы
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-panel p-6 rounded-lg text-left"
            >
              <div className="mb-4">
                <Users className="w-10 h-10 text-primary mb-2" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Поддержка 24/7</h2>
              <p className="text-foreground/70">
                Оперативная помощь от нашей службы поддержки в любое время
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
