
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTab from "@/components/admin/UsersTab";
import PassesTab from "@/components/admin/PassesTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import StatsTab from "@/components/admin/StatsTab";
import LogsTab from "@/components/admin/LogsTab";
import NewsTab from "@/components/admin/NewsTab";
import TasksTab from "@/components/admin/TasksTab";
import SupportTab from "@/components/admin/SupportTab";
import { ApiKeysTab } from "@/components/admin/ApiKeysTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <div className="container py-6 sm:py-10">
      <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between md:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Админ панель</h1>
          <p className="text-lg text-muted-foreground">
            Управление системой и пользователями
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="stats"
        className="mt-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="flex w-full h-auto flex-wrap items-center justify-start space-x-2 overflow-visible rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="stats" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Статистика
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Пользователи
          </TabsTrigger>
          <TabsTrigger 
            value="passes" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Пропуска
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Платежи
          </TabsTrigger>
          <TabsTrigger 
            value="news" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Новости
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Задачи
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Поддержка
          </TabsTrigger>
          <TabsTrigger 
            value="logs" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Логи
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            API Ключи
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="mt-6">
          <StatsTab />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
        <TabsContent value="passes" className="mt-6">
          <PassesTab />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <PaymentsTab />
        </TabsContent>
        <TabsContent value="news" className="mt-6">
          <NewsTab />
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <TasksTab />
        </TabsContent>
        <TabsContent value="support" className="mt-6">
          <SupportTab />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          <LogsTab />
        </TabsContent>
        <TabsContent value="api" className="mt-6">
          <ApiKeysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
