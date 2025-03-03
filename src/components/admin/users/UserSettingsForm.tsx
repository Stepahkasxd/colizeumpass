
import { useState } from "react";
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { USER_STATUSES } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, RefreshCw, RotateCw } from "lucide-react";

const userSettingsSchema = z.object({
  display_name: z.string().min(2, "Имя должно содержать минимум 2 символа").or(z.literal('')).nullable(),
  phone_number: z.string().nullable(),
  bio: z.string().nullable(),
  status: z.enum(USER_STATUSES),
  level: z.coerce.number().min(1, "Минимальный уровень - 1"),
  points: z.coerce.number().min(0, "Количество очков не может быть отрицательным"),
  free_points: z.coerce.number().min(0, "Количество бесплатных очков не может быть отрицательным"),
});

type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

interface UserSettingsFormProps {
  user: UserProfile;
  onSuccess?: () => void;
}

export function UserSettingsForm({ user, onSuccess }: UserSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      display_name: user.display_name || "",
      phone_number: user.phone_number || "",
      bio: user.bio || "",
      status: user.status,
      level: user.level,
      points: user.points,
      free_points: user.free_points || 0,
    },
  });

  async function onSubmit(data: UserSettingsFormValues) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          phone_number: data.phone_number,
          bio: data.bio,
          status: data.status,
          level: data.level,
          points: data.points,
          free_points: data.free_points,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Настройки пользователя успешно обновлены");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating user settings:", error);
      toast.error("Не удалось обновить настройки пользователя");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя пользователя</FormLabel>
                <FormControl>
                  <Input placeholder="Введите имя пользователя" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Номер телефона</FormLabel>
                <FormControl>
                  <Input placeholder="+7 (___) ___-__-__" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>О пользователе</FormLabel>
              <FormControl>
                <Textarea placeholder="Описание пользователя..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black/30 border-[#e4d079]/20">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black/90 border-[#e4d079]/20">
                    {USER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Уровень</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Очки</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="free_points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Бесплатные очки</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>
                Очки, которые пользователь может потратить на покупку пропусков
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Сохранить настройки
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
