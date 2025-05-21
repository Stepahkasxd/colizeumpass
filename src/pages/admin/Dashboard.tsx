import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Calendar, CreditCard, HelpCircle, History as HistoryIcon, Key, ListTodo, Newspaper, Ticket, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import UsersTab from "@/components/admin/UsersTab";
import StatsTab from "@/components/admin/StatsTab";
import PassesTab from "@/components/admin/PassesTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import NewsTab from "@/components/admin/NewsTab";
import LogsTab from "@/components/admin/LogsTab";
import TasksTab from "@/components/admin/TasksTab";
import SupportTab from "@/components/admin/SupportTab";
import ApiKeysTab from "@/components/admin/ApiKeysTab";
import EventsTab from "@/components/admin/EventsTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 animated-gradient">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-screen bg-dots opacity-5 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="pt-4 pb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-with-shadow">Панель администратора</h1>
              <p className="text-muted-foreground mt-1">
                Управление пользователями, пропусками и настройками системы
              </p>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-panel rounded-lg p-6"
          >
            <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <div className="border-b border-border">
                <TabsList className="bg-transparent h-auto p-0 w-full flex overflow-x-auto scrollbar-hide">
                  <TabsTrigger value="users" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Пользователи
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Статистика
                  </TabsTrigger>
                  <TabsTrigger value="passes" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <Ticket className="h-4 w-4 mr-2" />
                    Пропуска
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Платежи
                  </TabsTrigger>
                  <TabsTrigger value="news" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <Newspaper className="h-4 w-4 mr-2" />
                    Новости
                  </TabsTrigger>
                  <TabsTrigger value="events" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    События
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    Логи
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Задачи
                  </TabsTrigger>
                  <TabsTrigger value="support" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Поддержка
                  </TabsTrigger>
                  <TabsTrigger value="apikeys" className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <Key className="h-4 w-4 mr-2" />
                    API ключи
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="users" className="h-full flex-1 animate-fade-in">
                <UsersTab />
              </TabsContent>
              <TabsContent value="stats" className="h-full flex-1 animate-fade-in">
                <StatsTab />
              </TabsContent>
              <TabsContent value="passes" className="h-full flex-1 animate-fade-in">
                <PassesTab />
              </TabsContent>
              <TabsContent value="payments" className="h-full flex-1 animate-fade-in">
                <PaymentsTab />
              </TabsContent>
              <TabsContent value="news" className="h-full flex-1 animate-fade-in">
                <NewsTab />
              </TabsContent>
              <TabsContent value="events" className="h-full flex-1 animate-fade-in">
                <EventsTab />
              </TabsContent>
              <TabsContent value="logs" className="h-full flex-1 animate-fade-in">
                <LogsTab />
              </TabsContent>
              <TabsContent value="tasks" className="h-full flex-1 animate-fade-in">
                <TasksTab />
              </TabsContent>
              <TabsContent value="support" className="h-full flex-1 animate-fade-in">
                <SupportTab />
              </TabsContent>
              <TabsContent value="apikeys" className="h-full flex-1 animate-fade-in">
                <ApiKeysTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
