import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BuyPassForm } from "@/components/passes/BuyPassForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Reward } from "@/types/user";
import type { Json } from "@/integrations/supabase/types";
type PassLevel = {
  level: number;
  points_required: number;
  reward: {
    name: string;
    description?: string;
  };
};
type Pass = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  levels: PassLevel[];
};
type PassResponse = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  levels: PassLevel[] | Json;
};
const PassDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const {
    data: pass,
    isLoading: passLoading
  } = useQuery({
    queryKey: ['pass', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('passes').select('*').eq('id', id).single();
      if (error) throw error;
      const passData = data as PassResponse;
      return {
        ...passData,
        levels: Array.isArray(passData.levels) ? passData.levels.map((level: PassLevel) => ({
          ...level,
          points_required: level.points_required || level.level * 100
        })) : []
      } as Pass;
    }
  });
  const {
    data: profile,
    isLoading: profileLoading
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  const isRewardClaimed = (level: number, rewardName: string) => {
    if (!profile?.rewards || !Array.isArray(profile.rewards)) {
      return false;
    }
    return profile.rewards.some((r: Reward) => r.passLevel === level && r.name === rewardName && r.status === "claimed");
  };
  const getCurrentLevel = () => {
    if (!pass?.levels || !profile?.points) return 1;
    const currentLevel = pass.levels.findIndex(level => profile.points < level.points_required);
    return currentLevel === -1 ? pass.levels.length : currentLevel;
  };
  const calculateTotalProgress = () => {
    if (!pass?.levels || !profile?.points) return 0;
    const currentLevel = getCurrentLevel();
    const previousLevelPoints = currentLevel > 0 ? pass.levels[currentLevel - 1]?.points_required || 0 : 0;
    const nextLevelPoints = pass.levels[currentLevel]?.points_required || previousLevelPoints;
    const totalPoints = pass.levels[pass.levels.length - 1]?.points_required || 0;
    return Math.min(Math.round(profile.points / totalPoints * 100), 100);
  };
  const shouldShowProgressBar = (levelIndex: number) => {
    if (!profile?.points) return false;
    const currentLevel = getCurrentLevel();
    // Показываем прогресс-бар только для текущего уровня
    return levelIndex === currentLevel;
  };
  const calculateProgress = (requiredPoints: number) => {
    const currentPoints = profile?.points || 0;
    return Math.min(Math.round(currentPoints / requiredPoints * 100), 100);
  };
  const getPointsText = (requiredPoints: number) => {
    const currentPoints = profile?.points || 0;
    return `${currentPoints}/${requiredPoints}`;
  };
  const handleClaimReward = async (level: number, reward: any) => {
    try {
      const {
        data: profile
      } = await supabase.from('profiles').select('rewards, points').eq('id', user?.id).single();
      const currentRewards = (profile?.rewards || []) as Reward[];
      const currentPoints = profile?.points || 0;
      const levelData = pass?.levels.find(l => l.level === level);
      if (!levelData) {
        throw new Error('Уровень не найден');
      }
      if (currentPoints < levelData.points_required) {
        toast({
          title: "Недостаточно очков",
          description: `Необходимо набрать ${levelData.points_required} очков`,
          variant: "destructive"
        });
        return;
      }
      const existingReward = currentRewards.find(r => r.passLevel === level && r.name === reward.name);
      if (existingReward) {
        toast({
          title: "Награда уже получена",
          description: "Вы уже получили награду за этот уровень",
          variant: "destructive"
        });
        return;
      }
      const newReward: Reward = {
        id: crypto.randomUUID(),
        name: reward.name,
        description: reward.description,
        status: "claimed",
        earnedAt: new Date().toISOString(),
        passLevel: level
      };
      const updatedRewards = [...currentRewards, newReward];
      const {
        error
      } = await supabase.from('profiles').update({
        rewards: updatedRewards
      }).eq('id', user?.id);
      if (error) throw error;
      toast({
        title: "Награда добавлена!",
        description: "Перейдите в раздел Награды, чтобы увидеть её"
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить награду",
        variant: "destructive"
      });
    }
  };
  if (passLoading || profileLoading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse">Загрузка...</div>
      </div>;
  }
  if (!pass) {
    return <div className="min-h-screen pt-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Пропуск не найден</h1>
            <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6 -ml-4 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>

          <div className="glass-panel p-8 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-4">{pass.name}</h1>
            <p className="text-foreground/70 text-lg mb-4">{pass.description}</p>
            
            {/* Общий прогресс пропуска */}
            {profile?.has_pass && <div className="mb-8 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Общий прогресс</h3>
                  <span className="text-sm text-muted-foreground">
                    Уровень {getCurrentLevel()} из {pass.levels.length}
                  </span>
                </div>
                <Progress value={calculateTotalProgress()} className="h-3" />
              </div>}

            <p className="text-xl font-semibold mb-8">
              Стоимость: {pass.price.toLocaleString('ru-RU')} ₽
            </p>

            {pass.levels && Array.isArray(pass.levels) && pass.levels.length > 0 && <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Уровни и награды
                </h2>
                <Carousel opts={{
              align: "start",
              loop: true
            }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {pass.levels.map((level, index) => {
                  const isClaimed = isRewardClaimed(level.level, level.reward.name);
                  const progress = calculateProgress(level.points_required);
                  const showProgress = shouldShowProgressBar(index);
                  return <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <motion.div initial={{
                      opacity: 0,
                      x: 20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      duration: 0.3,
                      delay: index * 0.1
                    }} className={`h-full p-4 rounded-lg border ${isClaimed ? 'bg-primary/5 border-primary/10' : 'bg-muted/5 border-muted/10'}`}>
                            {showProgress && <div className="space-y-3 mb-4">
                                <p className="text-sm text-muted-foreground">
                                  Осталось очков: {getPointsText(level.points_required)}
                                </p>
                                <Progress value={progress} className="h-2" />
                              </div>}
                            
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                                ${isClaimed ? 'bg-primary text-primary-foreground' : progress >= 100 ? 'bg-primary/10' : 'bg-muted/10'}`}>
                                {progress >= 100 ? isClaimed ? <Trophy className="w-5 h-5" /> : <span className="text-lg font-semibold">{level.level}</span> : <Lock className="w-5 h-5 text-muted-foreground" />}
                              </div>
                              <div>
                                <h3 className="font-medium">Уровень {level.level}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {isClaimed ? 'Получено' : progress >= 100 ? 'Доступно' : 'Заблокировано'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-foreground/70">{level.reward.name}</p>
                              {level.reward.description && <p className="text-sm text-foreground/60">{level.reward.description}</p>}
                              {progress >= 100 && !isClaimed && <Button className="w-full mt-2" variant="outline" onClick={() => handleClaimReward(level.level, level.reward)}>
                                  Получить награду
                                </Button>}
                            </div>
                          </motion.div>
                        </CarouselItem>;
                })}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              </div>}
          </div>

          {(!user?.id || !profile?.has_pass) && <div className="flex justify-center">
              
            </div>}
        </motion.div>
      </div>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Покупка пропуска</DialogTitle>
          </DialogHeader>
          {pass && <BuyPassForm passId={pass.id} passName={pass.name} amount={pass.price} />}
        </DialogContent>
      </Dialog>
    </div>;
};
export default PassDetails;