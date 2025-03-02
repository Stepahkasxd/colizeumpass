
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Ticket, ShoppingBag, MessageSquare, CircleDollarSign, BarChart3, ActivitySquare, Newspaper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UsersTab from "@/components/admin/UsersTab";
import PassesTab from "@/components/admin/PassesTab";
import ProductsTab from "@/components/admin/ProductsTab";
import SupportTab from "@/components/admin/SupportTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import StatsTab from "@/components/admin/StatsTab";
import LogsTab from "@/components/admin/LogsTab";
import NewsTab from "@/components/admin/NewsTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

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

  if (authLoading || isCheckingAdmin) {
    return null;
  }

  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 text-glow">Панель администратора</h1>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid grid-cols-8 gap-4 mb-8">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Статистика</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Пользователи</span>
          </TabsTrigger>
          <TabsTrigger value="passes" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Пропуска</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Магазин</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">Новости</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Поддержка</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Платежи</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ActivitySquare className="h-4 w-4" />
            <span className="hidden sm:inline">Логи</span>
          </TabsTrigger>
        </TabsList>

        <div className="glass-panel p-6 rounded-lg">
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="passes">
            <PassesTab />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="news">
            <NewsTab />
          </TabsContent>
          <TabsContent value="support">
            <SupportTab />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
          <TabsContent value="logs">
            <LogsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
