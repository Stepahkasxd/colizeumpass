
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, Users, Wallet, ChevronRight, Tag, Star, Award, Rocket } from "lucide-react";
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
        .limit(1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pass[];
    }
  });

  const calculateDiscount = (price: number) => {
    const originalPrice = 999;
    if (price >= originalPrice) return null;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return {
      originalPrice,
      discount,
      currentPrice: price
    };
  };

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
    if (!pass?.id) {
      toast({
        title: "Ошибка",
        description: "Не удалось открыть информацию о пропуске",
        variant: "destructive",
      });
      return;
    }
    navigate(`/passes/${pass.id}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 animated-gradient overflow-hidden">
      {/* Декоративные элементы */}
      <div className="fixed top-0 left-0 w-full h-screen bg-dots opacity-5 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
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
            Современная система контроля доступа для компьютерного клуба. 
            Покупайте пропуска, получайте бонусы и наслаждайтесь игрой!
          </motion.p>

          {passes && passes.length > 0 && (
            <div className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mb-8 flex flex-col items-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-primary mr-2" />
                  <h2 className="text-2xl font-bold">Актуальный пропуск</h2>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-primary/30 to-primary"></div>
              </motion.div>
              
              <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
                {passes.map((pass) => {
                  const priceInfo = calculateDiscount(pass.price);
                  
                  return (
                    <motion.div
                      key={pass.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.7 }}
                      className="glass-panel glow-ring p-6 rounded-lg text-left relative group cursor-pointer card-hover"
                      onClick={() => handlePassClick(pass)}
                    >
                      <div className="flex justify-between items-start pb-16">
                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors flex items-center">
                            <Rocket className="w-5 h-5 mr-2 text-primary/70" />
                            {pass.name}
                          </h3>
                          <p className="text-foreground/70 mb-4 line-clamp-2">
                            {pass.description}
                          </p>
                          {pass.levels && Array.isArray(pass.levels) && pass.levels.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-primary/80">Уровни и награды:</h4>
                              <ul className="grid grid-cols-2 gap-2 text-sm text-foreground/70">
                                {pass.levels.slice(0, 4).map((level: any, index: number) => (
                                  <li key={index} className="flex items-center gap-2 group-hover:text-primary/80 transition-colors">
                                    <span className="inline-block w-2 h-2 bg-primary/40 rounded-full"></span>
                                    Уровень {level.level}: {level.reward.name}
                                  </li>
                                ))}
                              </ul>
                              {pass.levels.length > 4 && (
                                <p className="text-sm text-primary/80 mt-2">И ещё {pass.levels.length - 4} уровней...</p>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>

                      <div className="absolute bottom-6 right-6 flex flex-col items-end">
                        {priceInfo ? (
                          <>
                            <div className="mb-1.5 px-2 py-0.5 bg-green-500/10 rounded-full">
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-sm font-medium text-green-500">
                                  Скидка {priceInfo.discount}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm text-foreground/40 line-through">
                                {priceInfo.originalPrice} ₽
                              </span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                                {priceInfo.currentPrice} ₽
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
                            {pass.price} ₽
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

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

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass-panel p-6 rounded-lg text-left card-hover"
            >
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
                <Clock className="w-10 h-10 text-primary mb-2 relative" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Быстрая покупка</h2>
              <p className="text-foreground/70">
                Мгновенное оформление пропуска через администратора клуба
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="glass-panel p-6 rounded-lg text-left card-hover"
            >
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
                <Wallet className="w-10 h-10 text-primary mb-2 relative" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Система лояльности</h2>
              <p className="text-foreground/70">
                Накапливайте баллы за покупки и получайте бонусы
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="glass-panel p-6 rounded-lg text-left card-hover"
            >
              <div className="mb-4 relative">
                <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
                <Users className="w-10 h-10 text-primary mb-2 relative" />
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
