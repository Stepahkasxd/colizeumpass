
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PassesHeaderProps {
  onCreateClick: () => void;
}

export const PassesHeader = ({ onCreateClick }: PassesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Управление пропусками</h2>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Создать пропуск
      </Button>
    </div>
  );
};
