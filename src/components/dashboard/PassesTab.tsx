
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Trophy, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const PassesTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: activePasses, isLoading } = useQuery({
    queryKey: ['active-passes', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Получаем данные о текущем уровне пользователя
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('level, points')
        .eq('id', user.id)
        .single();

      // Получаем данные о пропуске
      const { data: passes, error } = await supabase
        .from('passes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching passes:", error);
        return [];
      }

      if (!passes || passes.length === 0) {
        console.log("No passes found");
        return [];
      }

      console.log("Fetched passes:", passes);

      // Для каждого пропуска вычисляем прогресс
      return passes.map(pass => {
        const levels = pass.levels as Array<{ level: number; points_required: number }>;
        const currentLevel = userProfile?.level || 1;
        const currentPoints = userProfile?.points || 0;
        
        // Находим текущий уровень в пропуске
        const currentLevelData = levels.find(l => l.level === currentLevel);
        const nextLevelData = levels.find(l => l.level === currentLevel + 1);
        
        // Вычисляем прогресс
        let progress = 0;
        if (currentLevelData && nextLevelData) {
          const pointsForLevel = nextLevelData.points_required - currentLevelData.points_required;
          const pointsProgress = currentPoints - currentLevelData.points_required;
          progress = Math.min(Math.round((pointsProgress / pointsForLevel) * 100), 100);
        }

        return {
          ...pass,
          currentLevel,
          maxLevel: levels.length,
          progress
        };
      });
    },
    enabled: !!user?.id
  });

  const handlePassClick = (passId: string) => {
    if (!passId) {
      toast({
        title: "Ошибка",
        description: "Идентификатор пропуска отсутствует",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Navigating to pass details with ID:", passId);
    navigate(`/passes/${passId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activePasses && activePasses.length > 0 ? (
        activePasses.map((pass) => (
          <Card 
            key={pass.id} 
            className="relative group cursor-pointer hover:shadow-lg transition-all overflow-hidden"
            onClick={() => handlePassClick(pass.id)}
          >
            <div className="absolute top-0 right-0 bg-primary/10 p-3 rounded-bl-lg">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {pass.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {pass.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Прогресс
                    </span>
                    <span className="text-primary">
                      Уровень {pass.currentLevel}/{pass.maxLevel}
                    </span>
                  </div>
                  <Progress value={pass.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Активен до: {new Date(pass.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="gap-1">
                    Подробнее
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>У вас пока нет активных пропусков</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Приобретите пропуск, чтобы начать получать награды и бонусы
            </p>
            <Button onClick={() => navigate("/")}>
              Купить пропуск
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
