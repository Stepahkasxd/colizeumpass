
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Ticket, 
  MessageSquare, 
  CircleDollarSign, 
  BarChart3, 
  ActivitySquare, 
  Newspaper, 
  CheckSquare,
  PanelLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UsersTab from "@/components/admin/UsersTab";
import PassesTab from "@/components/admin/PassesTab";
import SupportTab from "@/components/admin/SupportTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import StatsTab from "@/components/admin/StatsTab";
import LogsTab from "@/components/admin/LogsTab";
import NewsTab from "@/components/admin/NewsTab";
import TasksTab from "@/components/admin/TasksTab";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'stats');

  // Fetch pending notifications counts
  const { data: notificationCounts } = useQuery({
    queryKey: ['admin_notification_counts'],
    queryFn: async () => {
      const [paymentsResult, ticketsResult] = await Promise.all([
        supabase.from('payment_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open').eq('is_archived', false)
      ]);
      
      return {
        payments: paymentsResult.count || 0,
        tickets: ticketsResult.count || 0
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });
  
  const totalNotifications = 
    (notificationCounts?.payments || 0) + 
    (notificationCounts?.tickets || 0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });

        if (error) {
          console.error('Not authorized as admin:', error);
          setIsAdmin(false);
          navigate("/dashboard");
          return;
        }

        setIsAdmin(!!data);
        if (!data) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate("/dashboard");
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, navigate]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin?tab=${value}`, { replace: true });
  };

  // Set initial tab from URL or update URL if tab is set differently
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== 'stats') {
      navigate(`/admin?tab=${activeTab}`, { replace: true });
    }
  }, [tabFromUrl, activeTab, navigate]);

  if (authLoading || isCheckingAdmin) {
    return null;
  }

  if (!isAdmin || !user) {
    return null;
  }

  // Define the tabs configuration with icons, labels, and notification counts
  const tabConfig = [
    { id: 'stats', icon: BarChart3, label: 'Статистика', badge: null },
    { id: 'tasks', icon: CheckSquare, label: 'Дела', badge: totalNotifications > 0 ? totalNotifications : null },
    { id: 'users', icon: Users, label: 'Пользователи', badge: null },
    { id: 'passes', icon: Ticket, label: 'Пропуска', badge: null },
    { id: 'news', icon: Newspaper, label: 'Новости', badge: null },
    { id: 'support', icon: MessageSquare, label: 'Поддержка', badge: notificationCounts?.tickets || null },
    { id: 'payments', icon: CircleDollarSign, label: 'Платежи', badge: notificationCounts?.payments || null },
    { id: 'logs', icon: ActivitySquare, label: 'Логи', badge: null },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const sidebarVariants = {
    expanded: { width: "240px", transition: { duration: 0.3 } },
    collapsed: { width: "60px", transition: { duration: 0.3 } }
  };

  const contentVariants = {
    expanded: { marginLeft: "240px", transition: { duration: 0.3 } },
    collapsed: { marginLeft: "60px", transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.div 
        className="fixed h-screen bg-black/60 backdrop-blur-lg border-r border-[#e4d079]/10 z-50 shadow-lg"
        variants={sidebarVariants}
        initial="expanded"
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      >
        <div className="h-full flex flex-col p-3">
          <div className="flex items-center justify-between mb-6 p-2">
            {!isSidebarCollapsed && (
              <h2 className="text-xl font-semibold text-[#e4d079]/90">Админ панель</h2>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="ml-auto text-[#e4d079]/70 hover:text-[#e4d079] hover:bg-[#e4d079]/10"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {tabConfig.map((tab) => (
                <li key={tab.id}>
                  <Button
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${activeTab === tab.id ? 'bg-[#e4d079]/20 hover:bg-[#e4d079]/30 text-[#e4d079]' : 'text-[#e4d079]/70 hover:bg-[#e4d079]/10 hover:text-[#e4d079]'}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <tab.icon className="h-5 w-5" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="ml-3">{tab.label}</span>
                        {tab.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {tab.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pt-4 border-t border-[#e4d079]/10 mt-auto">
            {!isSidebarCollapsed && (
              <div className="px-3 py-2">
                <p className="text-[#e4d079]/50 text-xs">Вход выполнен как</p>
                <p className="text-[#e4d079] text-sm truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div 
        className="flex-1 min-h-screen"
        variants={contentVariants}
        initial="expanded"
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      >
        <motion.div 
          className="container py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-glow mb-2">{tabConfig.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-[#e4d079]/60">Управление {tabConfig.find(t => t.id === activeTab)?.label.toLowerCase()}</p>
          </div>
          
          <Card className="glass-panel p-6 rounded-lg">
            <TabsContent value="stats" className={activeTab === 'stats' ? 'block' : 'hidden'}>
              <StatsTab />
            </TabsContent>
            <TabsContent value="tasks" className={activeTab === 'tasks' ? 'block' : 'hidden'}>
              <TasksTab />
            </TabsContent>
            <TabsContent value="users" className={activeTab === 'users' ? 'block' : 'hidden'}>
              <UsersTab />
            </TabsContent>
            <TabsContent value="passes" className={activeTab === 'passes' ? 'block' : 'hidden'}>
              <PassesTab />
            </TabsContent>
            <TabsContent value="news" className={activeTab === 'news' ? 'block' : 'hidden'}>
              <NewsTab />
            </TabsContent>
            <TabsContent value="support" className={activeTab === 'support' ? 'block' : 'hidden'}>
              <SupportTab />
            </TabsContent>
            <TabsContent value="payments" className={activeTab === 'payments' ? 'block' : 'hidden'}>
              <PaymentsTab />
            </TabsContent>
            <TabsContent value="logs" className={activeTab === 'logs' ? 'block' : 'hidden'}>
              <LogsTab />
            </TabsContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
