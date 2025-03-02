import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import UsersTab from "@/components/admin/UsersTab";
import PassesTab from "@/components/admin/PassesTab";
import SupportTab from "@/components/admin/SupportTab";
import StatsTab from "@/components/admin/StatsTab";
import LogsTab from "@/components/admin/LogsTab";
import NewsTab from "@/components/admin/NewsTab";
import TasksTab from "@/components/admin/TasksTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { user } = useAuth();
  const navigate = useNavigate();

  // This function would typically check if the user has admin access
  // For now, we'll just check if the user is logged in
  if (!user) {
    return (
      <div className="container pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-2">Требуется вход в систему</h1>
            <p className="text-muted-foreground">
              Для доступа к панели администратора необходимо войти в систему
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="passes">Пропуска</TabsTrigger>
              <TabsTrigger value="support">Поддержка</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
              <TabsTrigger value="logs">Логи</TabsTrigger>
              <TabsTrigger value="news">Новости</TabsTrigger>
              <TabsTrigger value="tasks">Задачи</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-4">
            <UsersTab />
          </TabsContent>

          <TabsContent value="passes" className="space-y-4">
            <PassesTab />
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <SupportTab />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsTab />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <LogsTab />
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <NewsTab />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TasksTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
