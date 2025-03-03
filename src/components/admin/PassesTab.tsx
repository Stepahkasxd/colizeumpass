
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PassList } from "./passes/PassList";
import { PassesHeader } from "./passes/PassesHeader";
import { usePasses } from "@/hooks/use-passes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassForm } from "./passes/PassForm";
import { useToast } from "@/hooks/use-toast";

export type Pass = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  levels: {
    level: number;
    points_required: number;
    reward: {
      name: string;
      description: string;
    };
  }[];
  created_at: string;
};

const PassesTab = () => {
  const {
    passes,
    isLoading,
    editingPass,
    setEditingPass,
    handleCreatePass,
    handleEditPass,
    handleDeletePass,
  } = usePasses();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the current tab from URL or default to "list"
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("passTab") || "list";
  const passId = searchParams.get("passId");
  
  // Set editing pass when passId is in URL
  useEffect(() => {
    if (currentTab === "edit" && passId) {
      const pass = passes.find(p => p.id === passId);
      if (pass) {
        setEditingPass(pass);
      } else if (!isLoading) {
        toast({
          title: "Ошибка",
          description: `Пропуск с ID ${passId} не найден`,
          variant: "destructive"
        });
        navigate("/admin?tab=passes&passTab=list");
      }
    }
  }, [passId, passes, isLoading, currentTab, setEditingPass, toast, navigate]);

  const handleTabChange = (value: string) => {
    if (value === "list") {
      navigate("/admin?tab=passes&passTab=list");
      setEditingPass(null);
    } else if (value === "create") {
      navigate("/admin?tab=passes&passTab=create");
    } else if (value === "edit" && editingPass) {
      navigate(`/admin?tab=passes&passTab=edit&passId=${editingPass.id}`);
    }
  };

  // Handler for creating a new pass
  const onCreatePass = async (data: Omit<Pass, 'id' | 'created_at'>) => {
    await handleCreatePass(data);
    toast({
      title: "Успех",
      description: "Пропуск успешно создан",
    });
    navigate("/admin?tab=passes&passTab=list");
  };

  // Handler for editing a pass
  const onEditPass = async (data: Pass) => {
    await handleEditPass(data);
    toast({
      title: "Успех",
      description: "Пропуск успешно обновлен",
    });
    navigate("/admin?tab=passes&passTab=list");
  };

  return (
    <div>
      <PassesHeader 
        onCreateClick={() => handleTabChange("create")} 
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Список пропусков</TabsTrigger>
          <TabsTrigger value="create">Создать пропуск</TabsTrigger>
          {currentTab === "edit" && (
            <TabsTrigger value="edit">
              Редактировать пропуск
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <PassList
            passes={passes}
            isLoading={isLoading}
            onEdit={(pass) => {
              setEditingPass(pass);
              navigate(`/admin?tab=passes&passTab=edit&passId=${pass.id}`);
            }}
            onDelete={handleDeletePass}
          />
        </TabsContent>

        <TabsContent value="create">
          <div className="bg-card/50 p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Создать новый пропуск</h2>
            <PassForm
              onSubmit={onCreatePass}
              onCancel={() => navigate("/admin?tab=passes&passTab=list")}
            />
          </div>
        </TabsContent>

        <TabsContent value="edit">
          {editingPass && (
            <div className="bg-card/50 p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Редактировать пропуск</h2>
              <PassForm
                initialData={editingPass}
                onSubmit={onEditPass}
                onCancel={() => navigate("/admin?tab=passes&passTab=list")}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PassesTab;
