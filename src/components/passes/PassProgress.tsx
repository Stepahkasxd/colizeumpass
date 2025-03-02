
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

  const calculateLevelProgress = () => {
    if (!pass?.levels || !profile?.points) return 0;
    
    const currentLevelIndex = getCurrentLevel();
    
    // If user completed all levels
    if (currentLevelIndex >= pass.levels.length) {
      return 100;
    }
    
    // Get points required for current level
    const currentLevelPoints = pass.levels[currentLevelIndex]?.points_required || 0;
    
    // Get points required for previous level (0 if it's the first level)
    const previousLevelPoints = currentLevelIndex > 0 
      ? pass.levels[currentLevelIndex - 1]?.points_required || 0
      : 0;
    
    // Calculate points needed for this level
    const pointsNeededForLevel = currentLevelPoints - previousLevelPoints;
    
    // Calculate how many points the user has earned in this level
    const pointsEarnedInLevel = profile.points - previousLevelPoints;
    
    // Calculate percentage progress in this level
    if (pointsNeededForLevel <= 0) return 0;
    return Math.min(Math.round((pointsEarnedInLevel / pointsNeededForLevel) * 100), 100);
  };

  const getPointsDisplay = () => {
    if (!pass?.levels || !profile?.points) return "0/0";
    
    const currentLevelIndex = getCurrentLevel();
    
    // If user completed all levels
    if (currentLevelIndex >= pass.levels.length) {
      const maxPoints = pass.levels[pass.levels.length - 1]?.points_required || 0;
      return `${profile.points}/${maxPoints}`;
    }
    
    // Get points required for current level
    const currentLevelPoints = pass.levels[currentLevelIndex]?.points_required || 0;
    
    // Get points required for previous level
    const previousLevelPoints = currentLevelIndex > 0 
      ? pass.levels[currentLevelIndex - 1]?.points_required || 0
      : 0;
    
    return `${profile.points - previousLevelPoints}/${currentLevelPoints - previousLevelPoints}`;
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
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
        <span>До следующего уровня</span>
        <span>{getPointsDisplay()}</span>
      </div>
      <div className="relative">
        <Progress value={calculateLevelProgress()} className="h-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow">
            {calculateLevelProgress()}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};
