
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PassHeader } from "./PassHeader";
import { PassProgress } from "./PassProgress";
import { PassLevels } from "./PassLevels";
import { Motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Pass, UserProfile, Reward } from "@/types/user";
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

  const { data: pass, isLoading: isPassLoading } = useQuery({
    queryKey: ['pass', passId],
    queryFn: async () => {
      if (!passId) return null;
      
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .eq('id', passId)
        .single();
      
      if (error) {
        console.error('Error loading pass:', error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить информацию о пропуске",
          variant: "destructive"
        });
        navigate('/passes');
        throw error;
      }
      
      return data as Pass;
    },
    enabled: !!passId
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }
      
      return convertToUserProfile(data);
    },
    enabled: !!user?.id
  });

  if (isPassLoading || isProfileLoading || !pass) {
    return (
      <div className="container mx-auto p-4 max-w-4xl space-y-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Загрузка информации о пропуске...</p>
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
