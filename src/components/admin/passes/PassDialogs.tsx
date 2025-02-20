
import { Pass } from "../PassesTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PassForm } from "./PassForm";

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
  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Создать пропуск</DialogTitle>
          </DialogHeader>
          <PassForm
            onSubmit={onCreatePass}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPass} onOpenChange={() => setEditingPass(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать пропуск</DialogTitle>
          </DialogHeader>
          {editingPass && (
            <PassForm
              initialData={editingPass}
              onSubmit={onEditPass}
              onCancel={() => setEditingPass(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
