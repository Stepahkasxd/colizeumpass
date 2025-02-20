
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { PassesTab } from "@/components/dashboard/PassesTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { PurchasesTab } from "@/components/dashboard/PurchasesTab";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Ticket, Star, ShoppingCart, User2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types/user";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRootUser = user?.email === 'root@root.com';

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id
  });

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!user?.id
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-black/90 to-black/95 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="container relative pt-24 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2 mb-8"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-white/70">
              Привет, {profile?.display_name || 'Гость'}!
            </h2>
            <p className="text-sm text-white/50">
              ID: {user.id}
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white">
            Личный кабинет
          </h1>
        </motion.div>
        
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-lg border border-white/10 h-14 p-1 w-full sm:w-fit">
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
            <TabsTrigger 
              value="passes" 
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Пропуск</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Награды</span>
            </TabsTrigger>
            <TabsTrigger 
              value="purchases" 
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Покупки</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <User2 className="h-4 w-4" />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <TabsContent value="stats" className="space-y-4">
              <StatsTab />
            </TabsContent>

            <TabsContent value="passes" className="space-y-4">
              <PassesTab />
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <RewardsTab />
            </TabsContent>

            <TabsContent value="purchases" className="space-y-4">
              <PurchasesTab />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <ProfileTab />
            </TabsContent>
          </motion.div>
        </Tabs>

        {(isRootUser || isAdmin) && (
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 gap-2 bg-black/40 backdrop-blur-lg border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4" />
            Админ панель
          </Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
