
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Ticket, ShoppingBag, MessageSquare, CircleDollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UsersTab from "@/components/admin/UsersTab";
import PassesTab from "@/components/admin/PassesTab";
import ProductsTab from "@/components/admin/ProductsTab";
import SupportTab from "@/components/admin/SupportTab";
import PaymentsTab from "@/components/admin/PaymentsTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });

      if (error || !data) {
        console.error('Not authorized as admin:', error);
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6 text-glow">Панель администратора</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-5 gap-4 mb-8">
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
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Поддержка</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Платежи</span>
          </TabsTrigger>
        </TabsList>

        <div className="glass-panel p-6 rounded-lg">
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="passes">
            <PassesTab />
          </TabsContent>
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="support">
            <SupportTab />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;
