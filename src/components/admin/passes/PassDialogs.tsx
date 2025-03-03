import { Pass } from "../PassesTab";

interface PassDialogsProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  editingPass: Pass | null;
  setEditingPass: (pass: Pass | null) => void;
  onCreatePass: (data: Omit<Pass, 'id' | 'created_at'>) => Promise<void>;
  onEditPass: (data: Pass) => Promise<void>;
}

export const PassDialogs = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  editingPass,
  setEditingPass,
  onCreatePass,
  onEditPass,
}: PassDialogsProps) => {
  return null;
};
