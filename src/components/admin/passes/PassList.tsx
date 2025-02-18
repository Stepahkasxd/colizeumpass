
import { Pass } from "../PassesTab";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface PassListProps {
  passes: Pass[] | null;
  isLoading: boolean;
  onEdit: (pass: Pass) => void;
  onDelete: (id: string) => void;
}

export const PassList = ({ passes, isLoading, onEdit, onDelete }: PassListProps) => {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-3 px-4 text-left">Название</th>
            <th className="py-3 px-4 text-left">Описание</th>
            <th className="py-3 px-4 text-left">Требуемые очки</th>
            <th className="py-3 px-4 text-left">Уровни</th>
            <th className="py-3 px-4 text-left">Награды</th>
            <th className="py-3 px-4 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center">
                Загрузка...
              </td>
            </tr>
          ) : passes?.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center">
                Пропуска не найдены
              </td>
            </tr>
          ) : (
            passes?.map((pass) => (
              <tr key={pass.id} className="border-b">
                <td className="py-3 px-4 font-medium">{pass.name}</td>
                <td className="py-3 px-4">{pass.description || "—"}</td>
                <td className="py-3 px-4">{pass.points_required}</td>
                <td className="py-3 px-4">{pass.levels.length} уровней</td>
                <td className="py-3 px-4">{pass.rewards.length} наград</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(pass)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(pass.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
