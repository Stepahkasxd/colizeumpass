
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { PassesTab } from "@/components/dashboard/PassesTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(initialTab || "profile");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard?tab=${value}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container pt-24 pb-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground mt-1">
            Управление пропусками, статистика и персональные данные
          </p>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0 w-full justify-start gap-4">
            <TabsTrigger
              value="profile"
              className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Профиль
            </TabsTrigger>
            <TabsTrigger
              value="passes"
              className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Пропуска
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Статистика
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
            >
              Награды
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile" className="h-full flex-1">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="passes" className="h-full flex-1">
          <PassesTab />
        </TabsContent>
        <TabsContent value="stats" className="h-full flex-1">
          <StatsTab />
        </TabsContent>
        <TabsContent value="rewards" className="h-full flex-1">
          <RewardsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
