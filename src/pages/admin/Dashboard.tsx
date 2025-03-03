
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, 
  Ticket, 
  MessageSquare, 
  CircleDollarSign, 
  BarChart3, 
  ActivitySquare, 
  Newspaper, 
  CheckSquare,
  PanelLeft,
  Bell,
  Filter,
  Search
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { logActivity } from "@/utils/logger";
import { Database } from "@/integrations/supabase/types";
import UserActions from "@/components/admin/users/UserActions";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNotifications, setHasNotifications] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'stats');

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
    refetchInterval: 60000
  });
  
  const totalNotifications = 
    (notificationCounts?.payments || 0) + 
    (notificationCounts?.tickets || 0);

  useEffect(() => {
    setHasNotifications(totalNotifications > 0);
  }, [totalNotifications]);

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
        } else {
          await logActivity({
            user_id: user.id,
            category: 'admin',
            action: 'admin_login',
            details: { 
              timestamp: new Date().toISOString(),
              ip: window.location.hostname
            }
          });
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin?tab=${value}`, { replace: true });
  };

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

  const renderActiveTabContent = () => {
    if (activeTab === 'users') {
      return <UsersTab searchQuery={searchQuery} />;
    }
    
    switch (activeTab) {
      case 'stats':
        return <StatsTab />;
      case 'tasks':
        return <TasksTab />;
      case 'passes':
        return <PassesTab />;
      case 'news':
        return <NewsTab />;
      case 'support':
        return <SupportTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'logs':
        return <LogsTab />;
      default:
        return <StatsTab />;
    }
  };

  const handleClearNotifications = async () => {
    if (!user) return;
    
    try {
      toast.loading("Обрабатываем...");
      
      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: 'clear_notifications',
        details: { timestamp: new Date().toISOString() }
      });
      
      toast.dismiss();
      toast.success("Уведомления обработаны");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Ошибка при обработке уведомлений");
    }
  };

  return (
    <div className="min-h-screen flex pt-16">
      <motion.div 
        className="fixed h-screen bg-black/60 backdrop-blur-lg border-r border-[#e4d079]/10 z-40 shadow-lg top-16"
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
              title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-glow mb-2">{tabConfig.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-[#e4d079]/60">Управление {tabConfig.find(t => t.id === activeTab)?.label.toLowerCase()}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {activeTab === 'users' && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#e4d079]/40" />
                  <Input
                    type="search"
                    placeholder="Поиск пользователей..."
                    className="pl-9 w-64 bg-black/30 border-[#e4d079]/20 focus:border-[#e4d079]/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              
              {activeTab === 'users' && (
                <UserActions />
              )}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={`relative ${hasNotifications ? 'border-[#e4d079]/50' : 'border-[#e4d079]/20'}`}
                  >
                    <Bell className="h-5 w-5 text-[#e4d079]/70" />
                    {hasNotifications && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-black/80 backdrop-blur-lg border border-[#e4d079]/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#e4d079] text-sm">Уведомления</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#e4d079]/60 text-xs hover:text-[#e4d079]"
                        onClick={handleClearNotifications}
                      >
                        Очистить все
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {notificationCounts?.tickets ? (
                        <div className="flex items-center p-2 bg-[#e4d079]/5 rounded-md">
                          <MessageSquare className="h-4 w-4 text-[#e4d079]/70 mr-2" />
                          <div className="flex-1">
                            <p className="text-sm text-[#e4d079]/90">Новые тикеты в поддержке</p>
                            <p className="text-xs text-[#e4d079]/60">Количество: {notificationCounts.tickets}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#e4d079]"
                            onClick={() => handleTabChange('support')}
                          >
                            Перейти
                          </Button>
                        </div>
                      ) : null}
                      
                      {notificationCounts?.payments ? (
                        <div className="flex items-center p-2 bg-[#e4d079]/5 rounded-md">
                          <CircleDollarSign className="h-4 w-4 text-[#e4d079]/70 mr-2" />
                          <div className="flex-1">
                            <p className="text-sm text-[#e4d079]/90">Новые запросы на оплату</p>
                            <p className="text-xs text-[#e4d079]/60">Количество: {notificationCounts.payments}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#e4d079]"
                            onClick={() => handleTabChange('payments')}
                          >
                            Перейти
                          </Button>
                        </div>
                      ) : null}
                      
                      {!notificationCounts?.tickets && !notificationCounts?.payments && (
                        <p className="text-center text-[#e4d079]/50 text-sm py-2">Нет новых уведомлений</p>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Card className="glass-panel p-6 rounded-lg">
            {renderActiveTabContent()}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
