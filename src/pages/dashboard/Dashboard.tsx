
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { PassesTab } from "@/components/dashboard/PassesTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { ActivityTab } from "@/components/dashboard/ActivityTab";
import { Button } from "@/components/ui/button";
import { Shield, User, Ticket, BarChart3, Award, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(initialTab || "stats");
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Log dashboard view activity
    const logDashboardView = async () => {
      try {
        const { error } = await supabase.rpc('log_activity', {
          p_user_id: user.id,
          p_category: 'user',
          p_action: 'Вход в панель управления',
          p_details: { tab: activeTab }
        });
        
        if (error) {
          console.error('Error logging dashboard view:', error);
        }
      } catch (error) {
        console.error('Error logging dashboard view:', error);
      }
    };

    const checkAdminStatus = async () => {
      try {
        const {
          data,
          error
        } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        if (error) {
          console.error('Error checking admin status:', error);
          return;
        }
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
    logDashboardView();
  }, [user, navigate, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard?tab=${value}`);

    // Log tab change activity
    if (user) {
      // Using async IIFE to handle the asynchronous operation properly
      (async () => {
        try {
          const { error } = await supabase.rpc('log_activity', {
            p_user_id: user.id,
            p_category: 'user',
            p_action: `Переход на вкладку ${value}`,
            p_details: { previous_tab: activeTab, new_tab: value }
          });
          
          if (error) {
            console.error('Error logging tab change:', error);
          }
        } catch (error) {
          console.error('Error logging tab change:', error);
        }
      })();
    }
  };

  if (!user) {
    return null;
  }

  // Get user's name from email or use "пользователь" as fallback
  const userName = user.email ? user.email.split('@')[0] : "пользователь";
  return <div className="min-h-screen pt-20 pb-12 animated-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-screen bg-dots opacity-5 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      
      <div className="container relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.7
      }} className="pt-4 pb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center mb-8 glass-panel p-6 rounded-lg shimmer">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-with-shadow">Привет! {userName}</h1>
              <p className="text-muted-foreground mt-1">
                Это твой личный кабинет, тут ты можешь ознакомиться со статистикой, посмотреть твой прогресс в пропуске, забрать награды.
              </p>
              <p className="text-muted-foreground mt-1">
                Твой ID: {user.id}
              </p>
            </div>
            {isAdmin && <motion.div whileHover={{
            scale: 1.03
          }} transition={{
            duration: 0.2
          }}>
                <Button onClick={() => navigate("/admin")} variant="outline" className="flex items-center gap-2 dashboard-card hover:border-[#e4d079]/20 neon-glow">
                  <Shield className="h-4 w-4 dashboard-icon" />
                  Панель администратора
                </Button>
              </motion.div>}
          </div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2
        }} className="glass-panel rounded-lg p-6">
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <div className="border-b border-[#e4d079]/10">
                <TabsList className="bg-transparent h-auto p-0 w-full justify-start gap-4">
                  <TabsTrigger value="stats" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent flex items-center gap-2 hover:text-primary transition-colors">
                    <BarChart3 className="h-4 w-4 dashboard-icon" />
                    Статистика
                  </TabsTrigger>
                  <TabsTrigger value="passes" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent flex items-center gap-2 hover:text-primary transition-colors">
                    <Ticket className="h-4 w-4 dashboard-icon" />
                    Пропуска
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent flex items-center gap-2 hover:text-primary transition-colors">
                    <Award className="h-4 w-4 dashboard-icon" />
                    Награды
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent flex items-center gap-2 hover:text-primary transition-colors">
                    <History className="h-4 w-4 dashboard-icon" />
                    Активность
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="stats" className="h-full flex-1 animate-fade-in">
                <StatsTab />
              </TabsContent>
              <TabsContent value="passes" className="h-full flex-1 animate-fade-in">
                <PassesTab />
              </TabsContent>
              <TabsContent value="rewards" className="h-full flex-1 animate-fade-in">
                <RewardsTab />
              </TabsContent>
              <TabsContent value="activity" className="h-full flex-1 animate-fade-in">
                <ActivityTab />
              </TabsContent>
              <TabsContent value="profile" className="h-full flex-1 animate-fade-in">
                <ProfileTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>;
};
export default Dashboard;
