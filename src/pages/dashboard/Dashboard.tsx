
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { PassesTab } from "@/components/dashboard/PassesTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
      
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="passes">Боевые пропуски</TabsTrigger>
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
