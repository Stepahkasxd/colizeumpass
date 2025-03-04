
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
import { BarChart2, Users, Ticket, Bell, FileText, HeadphonesIcon, CreditCard, FileDigit, Key } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");

  const sidebarItems = [
    { id: "stats", label: "Статистика", icon: <BarChart2 className="w-5 h-5 text-[#e4d079]" /> },
    { id: "users", label: "Пользователи", icon: <Users className="w-5 h-5 text-[#e4d079]" /> },
    { id: "passes", label: "Пропуска", icon: <Ticket className="w-5 h-5 text-[#e4d079]" /> },
    { id: "payments", label: "Платежи", icon: <CreditCard className="w-5 h-5 text-[#e4d079]" /> },
    { id: "news", label: "Новости", icon: <Bell className="w-5 h-5 text-[#e4d079]" /> },
    { id: "tasks", label: "Дела", icon: <FileText className="w-5 h-5 text-[#e4d079]" /> },
    { id: "support", label: "Поддержка", icon: <HeadphonesIcon className="w-5 h-5 text-[#e4d079]" /> },
    { id: "logs", label: "Логи", icon: <FileDigit className="w-5 h-5 text-[#e4d079]" /> },
    { id: "api", label: "API Ключи", icon: <Key className="w-5 h-5 text-[#e4d079]" /> },
  ];

  return (
    <div className="flex h-screen bg-black pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-[#e4d079]/10 pt-5 fixed h-full overflow-y-auto">
        <div className="px-6 mb-6">
          <h2 className="text-xl font-bold text-[#e4d079]">Админ панель</h2>
        </div>
        
        <div className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-3 py-3 rounded-md transition-colors ${
                activeTab === item.id 
                  ? "bg-[#e4d079]/10 text-[#e4d079]" 
                  : "text-[#e4d079]/70 hover:bg-[#e4d079]/5 hover:text-[#e4d079]"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 p-6">
        {/* Content for each tab */}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "passes" && <PassesTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "support" && <SupportTab />}
        {activeTab === "logs" && <LogsTab />}
        {activeTab === "api" && <ApiKeysTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
