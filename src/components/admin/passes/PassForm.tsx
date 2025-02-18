
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
} from "@/components/ui/form";
import { Plus, Minus } from "lucide-react";
import { Pass } from "../PassesTab";

const passFormSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  description: z.string().nullable(),
  levels: z.array(z.object({
    level: z.number().min(1),
    points_required: z.number().min(0),
    reward: z.object({
      name: z.string().min(1, "Обязательное поле"),
      description: z.string().min(1, "Обязательное поле"),
    }),
  })),
});

type PassFormData = z.infer<typeof passFormSchema>;

interface PassFormProps {
  initialData?: Pass;
  onSubmit: (data: PassFormData) => Promise<void>;
  onCancel: () => void;
}

export const PassForm = ({ initialData, onSubmit, onCancel }: PassFormProps) => {
  const form = useForm<PassFormData>({
    resolver: zodResolver(passFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      levels: [{
        level: 1,
        points_required: 0,
        reward: { name: "", description: "" }
      }],
    },
  });

  const { fields: levelFields, append: appendLevel, remove: removeLevel } = 
    useFieldArray({
      control: form.control,
      name: "levels",
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Уровни</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLevel({
                    level: levelFields.length + 1,
                    points_required: 0,
                    reward: { name: "", description: "" }
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить уровень
                </Button>
              </div>
              {levelFields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-md">
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name={`levels.${index}.level`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Уровень</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`levels.${index}.points_required`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Требуемые очки</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`levels.${index}.reward.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название награды</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`levels.${index}.reward.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание награды</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(index)}
                    >
                      <Minus className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button type="submit">
            {initialData ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
