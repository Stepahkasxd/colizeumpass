
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Pass } from "@/types/user";
import { UserProfile } from "@/types/user";

interface PassProgressProps {
  pass: Pass;
  profile: UserProfile;
}

export const PassProgress = ({ pass, profile }: PassProgressProps) => {
  const getCurrentLevel = () => {
    if (!pass?.levels || !profile?.points) return 1;
    const currentLevel = pass.levels.findIndex(level => profile.points < level.points_required);
    return currentLevel === -1 ? pass.levels.length : currentLevel;
  };

  const calculateTotalProgress = () => {
    if (!pass?.levels || !profile?.points || pass.levels.length === 0) return 0;
    // Calculate progress as percentage of completed levels out of total levels
    const currentLevel = getCurrentLevel();
    return Math.round((currentLevel / pass.levels.length) * 100);
  };

  return (
    <motion.div 
      className="mb-8 space-y-3 bg-card/50 p-4 rounded-lg border border-muted/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Прогресс пропуска
        </h3>
        <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
          Уровень {getCurrentLevel()} из {pass.levels.length}
        </span>
      </div>
      <div className="relative">
        <Progress value={calculateTotalProgress()} className="h-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow">
            {calculateTotalProgress()}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};
