import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import ProfileTab from "@/components/dashboard/ProfileTab";
import StatsTab from "@/components/dashboard/StatsTab";
import RewardsTab from "@/components/dashboard/RewardsTab";
import PassesTab from "@/components/dashboard/PassesTab";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { user } = useAuth();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  if (!user) {
    return (
      <div className="container pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-2">Требуется вход в систему</h1>
            <p className="text-muted-foreground">
              Для доступа к личному кабинету необходимо войти в систему
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 flex flex-wrap justify-start">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="rewards">Награды</TabsTrigger>
            <TabsTrigger value="passes">Пропуска</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsTab />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <RewardsTab />
          </TabsContent>

          <TabsContent value="passes" className="space-y-4">
            <PassesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
