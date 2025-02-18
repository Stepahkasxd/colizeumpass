import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, Users, Wallet, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Pass = Database["public"]["Tables"]["passes"]["Row"];

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
      return data as Pass[];
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

  const handlePassClick = (pass: Pass) => {
    navigate(`/passes/${pass.id}`);
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
              <h2 className="text-2xl font-semibold mb-6">Пропуск</h2>
              <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
                {passes.map((pass) => (
                  <motion.div
                    key={pass.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-6 rounded-lg text-left relative group cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={() => handlePassClick(pass)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {pass.name}
                        </h3>
                        <p className="text-foreground/70 mb-4 line-clamp-2">
                          {pass.description}
                        </p>
                        {pass.levels && pass.levels.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-primary/80">Уровни и награды:</h4>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-foreground/70">
                              {(pass.levels as any[]).slice(0, 4).map((level, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 bg-primary/40 rounded-full"></span>
                                  Уровень {level.level}: {level.reward.name}
                                </li>
                              ))}
                            </ul>
                            {(pass.levels as any[]).length > 4 && (
                              <p className="text-sm text-primary/80 mt-2">И ещё {(pass.levels as any[]).length - 4} уровней...</p>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="absolute inset-0 border border-primary/10 rounded-lg group-hover:border-primary/30 transition-colors"></div>
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
