
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Rocket, Tag, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Pass = Database["public"]["Tables"]["passes"]["Row"];

interface CurrentPassCardProps {
  passes: Pass[];
}

const CurrentPassCard: React.FC<CurrentPassCardProps> = ({ passes }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  if (!passes || passes.length === 0) {
    return null;
  }

  return (
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
  );
};

export default CurrentPassCard;
