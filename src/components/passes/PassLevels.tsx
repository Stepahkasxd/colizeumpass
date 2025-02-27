
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Lock, Trophy, Star, Award, Rocket } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pass, Reward, UserProfile } from "@/types/user";

interface PassLevelsProps {
  pass: Pass;
  profile: UserProfile | null;
}

export const PassLevels = ({ pass, profile }: PassLevelsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const icons = [Trophy, Star, Award, Rocket];

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
      const { data: profile } = await supabase.from('profiles').select('rewards, points').eq('id', user?.id).single();
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
      const { error } = await supabase.from('profiles').update({
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

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-1 bg-primary rounded-full"></div>
        <h2 className="text-2xl font-bold text-foreground">Уровни и награды</h2>
      </div>
      
      <Carousel 
        opts={{
          align: "start",
          loop: true
        }} 
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {pass.levels.map((level, index) => {
            const isClaimed = isRewardClaimed(level.level, level.reward.name);
            const progress = calculateProgress(level.points_required);
            const showProgress = shouldShowProgressBar(index);
            const IconComponent = icons[index % icons.length];
            
            return (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`h-full transition-all duration-300 hover:shadow-md ${
                    isClaimed 
                      ? 'bg-gradient-to-br from-primary/10 to-background border-primary/20' 
                      : progress >= 100 
                        ? 'bg-gradient-to-br from-card/80 to-background border-primary/10 hover:border-primary/30' 
                        : 'bg-card/50 hover:bg-card/80'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                          ${isClaimed 
                            ? 'bg-primary text-primary-foreground' 
                            : progress >= 100 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {progress >= 100 
                            ? isClaimed 
                              ? <Trophy className="w-5 h-5" /> 
                              : <IconComponent className="w-5 h-5" />
                            : <Lock className="w-5 h-5" />
                          }
                        </div>
                        <CardDescription className={`px-3 py-1 rounded-full text-xs ${
                          isClaimed 
                            ? 'bg-primary/20 text-primary' 
                            : progress >= 100 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted/20 text-muted-foreground'
                        }`}>
                          {isClaimed 
                            ? 'Получено' 
                            : progress >= 100 
                              ? 'Доступно' 
                              : 'Заблокировано'
                          }
                        </CardDescription>
                      </div>
                      
                      <CardTitle className="text-lg flex items-center gap-2">
                        Уровень {level.level}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {showProgress && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Прогресс</span>
                            <span>{getPointsText(level.points_required)}</span>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-2" />
                            {progress > 15 && (
                              <span className="absolute text-[10px] text-white font-bold top-1/2 -translate-y-1/2 left-1">
                                {progress}%
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-1 mt-2">
                        <p className="font-medium flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          {level.reward.name}
                        </p>
                        {level.reward.description && (
                          <p className="text-sm text-foreground/60">
                            {level.reward.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    
                    {progress >= 100 && !isClaimed && (
                      <CardFooter>
                        <Button 
                          className="w-full mt-2 gap-2"
                          variant="outline" 
                          onClick={() => handleClaimReward(level.level, level.reward)}
                        >
                          <Trophy className="w-4 h-4" />
                          Получить награду
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="flex justify-center mt-4 gap-2">
          <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-8 w-8" />
          <CarouselNext className="relative right-0 top-0 translate-y-0 h-8 w-8" />
        </div>
      </Carousel>
    </motion.div>
  );
};
