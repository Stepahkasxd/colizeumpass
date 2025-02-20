
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { PassesTab } from "@/components/dashboard/PassesTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      if (error) throw error;
      return !!data;
    },
    enabled: !!user
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        {isAdmin && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4" />
            Админ панель
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="passes">Пропуск</TabsTrigger>
          <TabsTrigger value="rewards">Награды</TabsTrigger>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <StatsTab />
        </TabsContent>

        <TabsContent value="passes" className="space-y-4">
          <PassesTab />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsTab />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
