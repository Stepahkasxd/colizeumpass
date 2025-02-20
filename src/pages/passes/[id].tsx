import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Lock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BuyPassForm } from "@/components/passes/BuyPassForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Pass = Database["public"]["Tables"]["passes"]["Row"];

const PassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  const { data: pass, isLoading: passLoading } = useQuery({
    queryKey: ['pass', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Pass;
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleClaimReward = async (level: number, reward: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rewards')
        .eq('id', user?.id)
        .single();

      const currentRewards = profile?.rewards || [];
      
      const newReward = {
        id: crypto.randomUUID(),
        name: reward.name,
        description: reward.description,
        status: "available",
        earnedAt: new Date().toISOString(),
        passLevel: level
      };

      const updatedRewards = [...currentRewards, newReward];

      const { error } = await supabase
        .from('profiles')
        .update({ rewards: updatedRewards })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Награда добавлена!",
        description: "Перейдите в раздел Награды, чтобы получить её",
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить награду",
        variant: "destructive",
      });
    }
  };

  const currentLevel = profile?.level || 1;

  if (passLoading || profileLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Пропуск не найден</h1>
            <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Button
            variant="ghost"
            className="mb-6 -ml-4 gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>

          <div className="glass-panel p-8 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-4">{pass.name}</h1>
            <p className="text-foreground/70 text-lg mb-4">{pass.description}</p>
            <p className="text-xl font-semibold mb-8">
              Стоимость: {pass.price.toLocaleString('ru-RU')} ₽
            </p>

            {pass.levels && Array.isArray(pass.levels) && pass.levels.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Уровни и награды
                </h2>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {pass.levels.map((level: any, index: number) => (
                      <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`h-full p-4 rounded-lg border ${
                            currentLevel >= level.level 
                              ? 'bg-primary/5 border-primary/10' 
                              : 'bg-muted/5 border-muted/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {currentLevel >= level.level ? (
                                <span className="text-lg font-semibold">{level.level}</span>
                              ) : (
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">Уровень {level.level}</h3>
                              <p className="text-sm text-muted-foreground">
                                {currentLevel >= level.level ? 'Доступно' : 'Заблокировано'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground/70">{level.reward.name}</p>
                            {level.reward.description && (
                              <p className="text-sm text-foreground/60">{level.reward.description}</p>
                            )}
                            {currentLevel >= level.level && (
                              <Button 
                                className="w-full mt-2" 
                                variant="outline"
                                onClick={() => handleClaimReward(level.level, level.reward)}
                              >
                                Получить награду
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              </div>
            )}
          </div>

          {(!user?.id || !profile?.has_pass) && (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={() => setShowBuyDialog(true)}
              >
                Купить пропуск
                <Trophy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Покупка пропуска</DialogTitle>
          </DialogHeader>
          {pass && (
            <BuyPassForm
              passId={pass.id}
              passName={pass.name}
              amount={pass.price}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PassDetails;
