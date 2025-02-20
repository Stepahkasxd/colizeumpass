
import { PassList } from "./passes/PassList";
import { PassDialogs } from "./passes/PassDialogs";
import { PassesHeader } from "./passes/PassesHeader";
import { usePasses } from "@/hooks/use-passes";

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
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingPass,
    setEditingPass,
    handleCreatePass,
    handleEditPass,
    handleDeletePass,
  } = usePasses();

  return (
    <div>
      <PassesHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      <PassList
        passes={passes}
        isLoading={isLoading}
        onEdit={setEditingPass}
        onDelete={handleDeletePass}
      />

      <PassDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        editingPass={editingPass}
        setEditingPass={setEditingPass}
        onCreatePass={handleCreatePass}
        onEditPass={handleEditPass}
      />
    </div>
  );
};

export default PassesTab;
