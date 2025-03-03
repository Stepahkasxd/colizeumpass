
import { Pass } from "../PassesTab";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Ticket, Star, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface PassListProps {
  passes: Pass[] | null;
  isLoading: boolean;
  onEdit: (pass: Pass) => void;
  onDelete: (id: string) => void;
}

export const PassList = ({ passes, isLoading, onEdit, onDelete }: PassListProps) => {
  const navigate = useNavigate();
  
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const handleViewPass = (passId: string) => {
    console.log("Navigating to pass details with ID:", passId);
    navigate(`/passes/${passId}`);
  };

  return (
    <Card className="rounded-md border admin-border overflow-hidden bg-black/20 backdrop-blur-sm shadow-sm">
      <ScrollArea className="h-[calc(100vh-360px)]">
        <Table>
          <TableHeader className="bg-[#e4d079]/5">
            <TableRow>
              <TableHead className="text-left font-medium admin-text w-[250px]">Название</TableHead>
              <TableHead className="text-left font-medium admin-text w-[350px]">Описание</TableHead>
              <TableHead className="text-left font-medium admin-text w-[120px]">Стоимость</TableHead>
              <TableHead className="text-left font-medium admin-text w-[120px]">Уровни</TableHead>
              <TableHead className="text-left font-medium admin-text w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 px-4 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin h-8 w-8 border-4 border-[#e4d079]/30 border-t-[#e4d079] rounded-full"></div>
                    <p>Загрузка пропусков...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : passes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 px-4 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Ticket className="h-8 w-8 text-[#e4d079]/50" />
                    <p>Пропуска не найдены</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              passes?.map((pass) => (
                <motion.tr 
                  key={pass.id} 
                  variants={rowVariants}
                  className="border-b border-[#e4d079]/10 hover:bg-[#e4d079]/5 transition-colors"
                >
                  <TableCell className="py-3 px-4 font-medium text-[#e4d079]">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-[#e4d079]/70" />
                      {pass.name}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-foreground">
                    {pass.description || "—"}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-mono text-green-400">
                    {pass.price} руб.
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="bg-[#e4d079]/10 border border-[#e4d079]/20 text-[#e4d079] px-2 py-0.5 rounded-full text-xs">
                        {pass.levels.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(pass)}
                        className="hover:bg-[#e4d079]/10 hover:text-[#e4d079] transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(pass.id)}
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPass(pass.id)}
                        className="hover:bg-[#e4d079]/10 hover:text-[#e4d079] transition-colors"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
