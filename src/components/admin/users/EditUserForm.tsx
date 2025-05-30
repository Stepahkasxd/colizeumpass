
import { UserProfile, USER_STATUSES } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/utils/logger";

const userFormSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  level: z.number().min(0),
  points: z.number().min(0),
  free_points: z.number().min(0),
  status: z.enum(['Standard', 'Premium', 'VIP']),
  has_pass: z.boolean()
});

interface EditUserFormProps {
  user: UserProfile;
  onSubmit: (data: UserProfile) => Promise<void>;
  onCancel: () => void;
}

export const EditUserForm = ({ user, onSubmit, onCancel }: EditUserFormProps) => {
  const { user: currentUser } = useAuth();
  
  const form = useForm<UserProfile>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: user.id,
      display_name: user.display_name,
      phone_number: user.phone_number,
      level: user.level,
      points: user.points,
      free_points: user.free_points || 0,
      status: user.status,
      has_pass: user.has_pass
    }
  });

  const handleSubmit = async (data: UserProfile) => {
    if (!currentUser) return;

    // Находим измененные поля
    const changes = Object.entries(data).reduce((acc, [key, value]) => {
      if (user[key as keyof UserProfile] !== value) {
        acc[key] = {
          from: user[key as keyof UserProfile],
          to: value
        };
      }
      return acc;
    }, {} as Record<string, { from: any; to: any }>);

    // Если есть изменения, логируем их
    if (Object.keys(changes).length > 0) {
      await logActivity({
        user_id: currentUser.id,
        category: 'admin',
        action: 'update_user',
        details: {
          target_user_id: user.id,
          target_user_name: user.display_name,
          changes
        }
      });
    }

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Статус</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="has_pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пропуск</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'true')}
                value={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Наличие пропуска" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Есть</SelectItem>
                  <SelectItem value="false">Нет</SelectItem>
                </SelectContent>
              </Select>
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
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Очки прогресса</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Очки, используемые для прогресса в боевом пропуске
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="free_points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Свободные очки</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Очки, которые можно потратить на покупку товаров
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button type="submit">
            Сохранить
          </Button>
        </div>
      </form>
    </Form>
  );
};
