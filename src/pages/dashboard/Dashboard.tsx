
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
    <div className="min-h-screen animated-gradient relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(228,208,121,0.07)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#e4d079]/5 to-transparent pointer-events-none" />
      
      <div className="container relative pt-24 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-yellow-400/70"
          >
            Привет, {profile?.display_name || 'Гость'}!
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400/50 bg-clip-text text-transparent relative"
          >
            Личный кабинет
            <span className="absolute -bottom-2 left-0 w-20 h-[2px] bg-gradient-to-r from-[#e4d079] to-transparent"></span>
          </motion.h1>
        </motion.div>
        
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="glass-panel h-14 p-1 w-full sm:w-fit">
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-[#e4d079] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(228,208,121,0.3)] gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
            <TabsTrigger 
              value="passes" 
              className="data-[state=active]:bg-[#e4d079] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(228,208,121,0.3)] gap-2"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Пропуск</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-[#e4d079] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(228,208,121,0.3)] gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Награды</span>
            </TabsTrigger>
            <TabsTrigger 
              value="purchases" 
              className="data-[state=active]:bg-[#e4d079] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(228,208,121,0.3)] gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Покупки</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-[#e4d079] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(228,208,121,0.3)] gap-2"
            >
              <User2 className="h-4 w-4" />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative"
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
            className="fixed bottom-4 right-4 gap-2 glass-panel hover:bg-[#e4d079]/10 hover:border-[#e4d079]/30 z-50"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4 text-[#e4d079]" />
            Админ панель
          </Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
