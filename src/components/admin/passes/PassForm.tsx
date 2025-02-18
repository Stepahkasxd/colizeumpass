
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  points_required: z.number().min(0),
  levels: z.array(z.object({
    level: z.number().min(1),
    points_required: z.number().min(0),
  })),
  rewards: z.array(z.object({
    name: z.string().min(1, "Обязательное поле"),
    description: z.string().min(1, "Обязательное поле"),
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
      points_required: 0,
      levels: [{ level: 1, points_required: 0 }],
      rewards: [{ name: "", description: "" }],
    },
  });

  const { fields: levelFields, append: appendLevel, remove: removeLevel } = 
    useFieldArray({
      control: form.control,
      name: "levels",
    });

  const { fields: rewardFields, append: appendReward, remove: removeReward } = 
    useFieldArray({
      control: form.control,
      name: "rewards",
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="points_required"
          render={({ field }) => (
            <FormItem>
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Уровни</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendLevel({ level: levelFields.length + 1, points_required: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить уровень
            </Button>
          </div>
          {levelFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLevel(index)}
                className="mb-2"
              >
                <Minus className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Награды</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendReward({ name: "", description: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить награду
            </Button>
          </div>
          {rewardFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name={`rewards.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Название награды</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`rewards.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Описание награды</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeReward(index)}
                className="mb-2"
              >
                <Minus className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
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
