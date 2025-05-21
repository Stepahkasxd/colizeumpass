
import { Award, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const UpcomingEvents = () => {
  return (
    <motion.div variants={itemVariants}>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Ближайшие события
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Бонусные очки
                </p>
                <p className="text-sm text-muted-foreground">
                  Через 2 дня вы получите ежемесячный бонус в 100 очков
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Награда за уровень
                </p>
                <p className="text-sm text-muted-foreground">
                  До следующей награды осталось набрать 150 очков
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
