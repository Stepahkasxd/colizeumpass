
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Minus, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";
import { Pass } from "../PassesTab";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const passFormSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  description: z.string().nullable(),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  levels: z.array(z.object({
    level: z.number().min(1, "Минимальный уровень: 1"),
    points_required: z.number().min(0, "Требуемые очки не могут быть отрицательными"),
    reward: z.object({
      name: z.string().min(1, "Обязательное поле"),
      description: z.string().min(1, "Обязательное поле"),
    }),
  })).min(1, "Добавьте хотя бы один уровень"),
});

type PassFormData = z.infer<typeof passFormSchema>;

interface PassFormProps {
  initialData?: Pass;
  onSubmit: (data: PassFormData) => Promise<void>;
  onCancel: () => void;
}

export const PassForm = ({ initialData, onSubmit, onCancel }: PassFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(null);

  const form = useForm<PassFormData>({
    resolver: zodResolver(passFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      levels: [{
        level: 1,
        points_required: 0,
        reward: { name: "", description: "" }
      }],
    },
  });

  const { fields: levelFields, append: appendLevel, remove: removeLevel, move: moveLevel } = 
    useFieldArray({
      control: form.control,
      name: "levels",
    });

  // Sort levels when initializing form
  useEffect(() => {
    if (initialData && initialData.levels.length > 0) {
      const formValues = form.getValues();
      if (formValues.levels && formValues.levels.length > 1) {
        const sortedLevels = [...formValues.levels].sort((a, b) => a.level - b.level);
        sortedLevels.forEach((level, index) => {
          form.setValue(`levels.${index}`, level);
        });
      }
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data: PassFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLevel = () => {
    const currentLevels = form.getValues().levels;
    const maxLevel = currentLevels.length > 0 
      ? Math.max(...currentLevels.map(l => l.level)) 
      : 0;
    
    const newPointsRequired = currentLevels.length > 0 
      ? Math.max(...currentLevels.map(l => l.points_required)) + 100 
      : 0;
    
    appendLevel({
      level: maxLevel + 1,
      points_required: newPointsRequired,
      reward: { name: "", description: "" }
    });
    
    // Scroll to the new level after a short delay
    setTimeout(() => {
      setSelectedLevelIndex(levelFields.length);
    }, 100);
  };

  const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      moveLevel(index, index - 1);
      setSelectedLevelIndex(index - 1);
    } else if (direction === 'down' && index < levelFields.length - 1) {
      moveLevel(index, index + 1);
      setSelectedLevelIndex(index + 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-6 bg-background/50 p-4 rounded-lg border">
              <h3 className="text-md font-medium">Основная информация</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ''} 
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена (в рублях)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="text-md font-medium mb-1">Структура уровней</h3>
                <p className="text-sm text-muted-foreground">
                  Всего уровней: {levelFields.length}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddLevel}
                variant="default"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить уровень
              </Button>
            </div>
            
            <div className="space-y-2">
              {levelFields.map((field, index) => (
                <div 
                  key={field.id} 
                  className={`p-2 border rounded cursor-pointer transition-colors ${selectedLevelIndex === index ? 'border-primary bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedLevelIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedLevelIndex === index ? "default" : "outline"}>
                        Уровень {form.watch(`levels.${index}.level`)}
                      </Badge>
                      <span className="text-sm truncate max-w-[200px]">
                        {form.watch(`levels.${index}.reward.name`) || "Без названия"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleMoveLevel(index, 'up');
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleMoveLevel(index, 'down');
                        }}
                        disabled={index === levelFields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive/80"
                        onClick={(e) => { 
                          e.stopPropagation();
                          removeLevel(index);
                          if (selectedLevelIndex === index) {
                            setSelectedLevelIndex(null);
                          }
                        }}
                        disabled={levelFields.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Редактор уровня */}
          <div className="lg:col-span-3 border rounded-lg">
            {selectedLevelIndex !== null && levelFields[selectedLevelIndex] ? (
              <Card className="border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">
                      Редактирование уровня {form.watch(`levels.${selectedLevelIndex}.level`)}
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedLevelIndex(null)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Не забудьте сохранить изменения</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`levels.${selectedLevelIndex}.level`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Номер уровня</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`levels.${selectedLevelIndex}.points_required`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Требуемые очки</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`levels.${selectedLevelIndex}.reward.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название награды</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`levels.${selectedLevelIndex}.reward.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание награды</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-sm">
                  <h3 className="text-lg font-medium mb-2">Выберите уровень для редактирования</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Выберите уровень из списка слева или добавьте новый уровень
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddLevel}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить новый уровень
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
