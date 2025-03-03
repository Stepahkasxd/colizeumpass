
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PassHeader } from "./PassHeader";
import { PassProgress } from "./PassProgress";
import { PassLevels } from "./PassLevels";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Pass, UserProfile, Reward, PassLevel } from "@/types/user";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert Json rewards to Reward type
const convertJsonToRewards = (jsonRewards: Json[] | null): Reward[] => {
  if (!jsonRewards || !Array.isArray(jsonRewards)) {
    return [];
  }
  
  return jsonRewards.map(reward => {
    if (typeof reward !== 'object' || reward === null) {
      return {
        id: crypto.randomUUID(),
        name: 'Unknown Reward',
        status: 'available',
        earnedAt: new Date().toISOString()
      };
    }
    
    const rewardObj = reward as Record<string, Json>;
    
    return {
      id: typeof rewardObj.id === 'string' ? rewardObj.id : crypto.randomUUID(),
      name: typeof rewardObj.name === 'string' ? rewardObj.name : 'Unknown Reward',
      status: rewardObj.status === 'claimed' ? 'claimed' : 'available',
      earnedAt: typeof rewardObj.earnedAt === 'string' ? rewardObj.earnedAt : 
                typeof rewardObj.earned_at === 'string' ? rewardObj.earned_at :
                new Date().toISOString(),
      description: typeof rewardObj.description === 'string' ? rewardObj.description : undefined,
      passLevel: typeof rewardObj.passLevel === 'number' ? rewardObj.passLevel : 
                 typeof rewardObj.pass_level === 'number' ? rewardObj.pass_level : 
                 undefined
    };
  });
};

// Helper function to convert Json levels to PassLevel type
const convertJsonToPassLevels = (jsonLevels: Json | null): PassLevel[] => {
  if (!jsonLevels || !Array.isArray(jsonLevels)) {
    return [];
  }
  
  return jsonLevels.map(level => {
    if (typeof level !== 'object' || level === null) {
      return {
        level: 0,
        points_required: 0,
        reward: { name: 'Unknown Reward' }
      };
    }
    
    const levelObj = level as Record<string, Json>;
    
    return {
      level: typeof levelObj.level === 'number' ? levelObj.level : 0,
      points_required: typeof levelObj.points_required === 'number' ? levelObj.points_required : 0,
      reward: {
        name: levelObj.reward && typeof levelObj.reward === 'object' && 
              levelObj.reward !== null && 'name' in levelObj.reward && 
              typeof levelObj.reward.name === 'string' ? levelObj.reward.name : 'Unknown Reward',
        description: levelObj.reward && typeof levelObj.reward === 'object' && 
                     levelObj.reward !== null && 'description' in levelObj.reward && 
                     typeof levelObj.reward.description === 'string' ? levelObj.reward.description : undefined
      }
    };
  });
};

// Helper function to convert database profile to UserProfile type
const convertToUserProfile = (dbProfile: any): UserProfile => {
  return {
    id: dbProfile.id,
    created_at: dbProfile.created_at,
    display_name: dbProfile.display_name,
    phone_number: dbProfile.phone_number,
    level: dbProfile.level || 1,
    points: dbProfile.points || 0,
    free_points: dbProfile.free_points || 0,
    status: dbProfile.status || 'Standard',
    has_pass: dbProfile.has_pass || false,
    rewards: convertJsonToRewards(dbProfile.rewards),
    is_blocked: dbProfile.is_blocked || false
  };
};

export const PassDetails = () => {
  const { passId } = useParams<{ passId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Query pass details
  const { data: pass, isLoading: isPassLoading, error: passError } = useQuery({
    queryKey: ['pass', passId],
    queryFn: async () => {
      if (!passId) return null;
      
      console.log("Fetching pass with ID:", passId);
      
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .eq('id', passId)
        .single();
      
      if (error) {
        console.error('Error loading pass:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No pass data found');
        throw new Error('Pass not found');
      }
      
      console.log("Pass data received:", data);
      
      // Convert the database pass to our Pass type
      const typedPass: Pass = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        levels: convertJsonToPassLevels(data.levels)
      };
      
      return typedPass;
    },
    retry: 1, // Only retry once
    refetchOnWindowFocus: false
  });

  // Query user profile
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log("Fetching user profile:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }
      
      if (!data) {
        console.log('No profile data found');
        return null;
      }
      
      console.log("Profile data received");
      
      return convertToUserProfile(data);
    },
    enabled: !!user?.id,
    retry: 1, // Only retry once
    refetchOnWindowFocus: false
  });

  // Handle errors
  if (passError) {
    console.error("Pass error:", passError);
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-8">
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <p className="text-muted-foreground">Ошибка загрузки информации о пропуске</p>
          <button 
            className="px-4 py-2 bg-primary/20 rounded-md text-primary hover:bg-primary/30" 
            onClick={() => navigate('/dashboard?tab=passes')}
          >
            Вернуться к пропускам
          </button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isPassLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Загрузка информации о пропуске...</p>
        </div>
      </div>
    );
  }

  // Handle case when no pass is found
  if (!pass) {
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-8">
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <p className="text-muted-foreground">Пропуск не найден</p>
          <button 
            className="px-4 py-2 bg-primary/20 rounded-md text-primary hover:bg-primary/30" 
            onClick={() => navigate('/dashboard?tab=passes')}
          >
            Вернуться к пропускам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-8">
      <PassHeader pass={pass} />
      
      <Separator />
      
      {profile && <PassProgress pass={pass} profile={profile} />}
      
      <PassLevels pass={pass} profile={profile} />
    </div>
  );
};
