
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PassesTab = () => {
  const navigate = useNavigate();
  const { data: activePasses } = useQuery({
    queryKey: ['active-passes'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (profile?.has_pass) {
        const { data: passes } = await supabase
          .from('passes')
          .select('*')
          .limit(1)
          .order('created_at', { ascending: false });

        return passes;
      }
      return [];
    }
  });

  return (
    <div className="space-y-6">
      {activePasses && activePasses.length > 0 ? (
        activePasses.map((pass) => (
          <Card key={pass.id} className="relative group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate(`/passes/${pass.id}`)}>
            <CardHeader>
              <CardTitle>{pass.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {pass.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс</span>
                    <span className="text-primary">Уровень 3/10</span>
                  </div>
                  <Progress value={30} />
                </div>

                <Button variant="outline" className="w-full">
                  Подробнее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
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
