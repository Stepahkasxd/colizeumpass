
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BuyPassForm } from "@/components/passes/BuyPassForm";
import { useAuth } from "@/context/AuthContext";

import { PassHeader } from "@/components/passes/PassHeader";
import { PassLevels } from "@/components/passes/PassLevels";
import { PassProgress } from "@/components/passes/PassProgress";
import { Pass, PassLevel, UserProfile, USER_STATUSES, Reward } from "@/types/user";

const PassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  const { data: pass, isLoading: passLoading } = useQuery({
    queryKey: ['pass', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('passes').select('*').eq('id', id).single();
      if (error) throw error;
      const passData = data as any;
      return {
        ...passData,
        levels: Array.isArray(passData.levels) ? passData.levels.map((level: PassLevel) => ({
          ...level,
          points_required: level.points_required || level.level * 100
        })) : []
      } as Pass;
    }
  });

  // Function to validate user status
  const validateUserStatus = (status: string): "Standard" | "Premium" | "VIP" => {
    if (USER_STATUSES.includes(status as any)) {
      return status as "Standard" | "Premium" | "VIP";
    }
    return "Standard"; // Default fallback
  };

  // Function to validate and transform rewards data
  const validateRewards = (rawRewards: any[]): Reward[] => {
    if (!Array.isArray(rawRewards)) return [];
    
    return rawRewards.map(reward => ({
      id: reward.id || crypto.randomUUID(),
      name: reward.name || 'Unknown Reward',
      status: reward.status === 'claimed' ? 'claimed' : 'available',
      earnedAt: reward.earnedAt || reward.earned_at || new Date().toISOString(),
      description: reward.description,
      passLevel: reward.passLevel || reward.pass_level
    }));
  };

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      
      // Transform profile data to ensure types match
      return {
        id: data.id,
        created_at: data.created_at,
        display_name: data.display_name,
        phone_number: data.phone_number,
        level: data.level || 1,
        points: data.points || 0,
        free_points: data.free_points || 0,
        status: validateUserStatus(data.status),
        has_pass: !!data.has_pass,
        rewards: validateRewards(data.rewards || []),
        is_blocked: !!data.is_blocked
      } as UserProfile;
    },
    enabled: !!user?.id
  });

  if (passLoading || profileLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-40 mb-4 bg-muted rounded"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
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
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-background to-background/80">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Button 
            variant="ghost" 
            className="mb-6 -ml-4 gap-2 hover:bg-primary/10 transition-colors" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>

          <motion.div 
            className="bg-gradient-to-br from-primary/5 to-background border border-primary/10 rounded-xl overflow-hidden shadow-lg mb-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="p-8">
              <PassHeader pass={pass} />
              
              {/* Show progress if user has pass */}
              {profile?.has_pass && (
                <PassProgress profile={profile} pass={pass} />
              )}

              {/* Only show buy pass button if user is not logged in or doesn't have a pass */}
              {(!user?.id || (profile && !profile.has_pass)) && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button 
                    size="lg" 
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity text-white"
                    onClick={() => setShowBuyDialog(true)}
                  >
                    <Star className="w-5 h-5" />
                    Приобрести пропуск
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {pass.levels && Array.isArray(pass.levels) && pass.levels.length > 0 && (
            <PassLevels pass={pass} profile={profile} />
          )}
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
    </div>
  );
};

export default PassDetails;
