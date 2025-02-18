
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react"; // Добавляем импорт useState
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
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

type Pass = Database["public"]["Tables"]["passes"]["Row"];

const PassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  const { data: pass, isLoading } = useQuery({
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

  if (isLoading) {
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
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>

          <div className="glass-panel p-8 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-4">{pass.name}</h1>
            <p className="text-foreground/70 text-lg mb-8">{pass.description}</p>

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
                          className="h-full p-4 rounded-lg bg-primary/5 border border-primary/10"
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-semibold">{level.level}</span>
                            </div>
                            <div>
                              <h3 className="font-medium">Уровень {level.level}</h3>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground/70">{level.reward.name}</p>
                            {level.reward.description && (
                              <p className="text-sm text-foreground/60">{level.reward.description}</p>
                            )}
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex left-2" />
                  <CarouselNext className="hidden sm:flex right-2" />
                </Carousel>
              </div>
            )}
          </div>

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
              amount={10000} // Здесь нужно указать реальную стоимость пропуска
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PassDetails;
