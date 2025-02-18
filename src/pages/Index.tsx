
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, Users, Wallet, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
        .order('price', { ascending: true });

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

  const passTemplates = [
    {
      name: "Стандарт",
      description: "Идеально для начинающих геймеров",
      price: 399,
      color: "from-[#F2FCE2] to-[#E5DEFF]",
      highlight: "text-[#6E59A5]",
      border: "border-[#6E59A5]/20",
      features: ["Базовый доступ", "5 уровней наград", "Стандартная поддержка"]
    },
    {
      name: "Продвинутый",
      description: "Для опытных игроков",
      price: 499,
      color: "from-[#E5DEFF] to-[#FDE1D3]",
      highlight: "text-[#7E69AB]",
      border: "border-[#7E69AB]/20",
      features: ["Расширенный доступ", "10 уровней наград", "Приоритетная поддержка"]
    },
    {
      name: "Премиум",
      description: "Максимум возможностей",
      price: 999,
      color: "from-[#9b87f5] to-[#8B5CF6]",
      highlight: "text-white",
      border: "border-white/20",
      features: ["VIP доступ", "15 уровней наград", "24/7 VIP поддержка"]
    }
  ];

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

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {passTemplates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 border ${template.border}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-10`} />
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold ${template.highlight}`}>
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className={`text-3xl font-bold ${template.highlight}`}>
                        {template.price} ₽
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {template.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 ${template.highlight}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      onClick={handleBuyPass}
                      variant={index === 2 ? "default" : "outline"}
                    >
                      Выбрать
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
