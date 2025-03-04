import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { generateApiKey } from "@/utils/apiKeyUtils";
import { Copy, Plus, Trash2, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { logActivity } from "@/utils/logger";
import { Link } from "react-router-dom";

// Form schema for creating a new API key
const formSchema = z.object({
  name: z.string().min(3, "Название должно содержать минимум 3 символа"),
  description: z.string().optional(),
  expires_at: z.string().optional(),
});

type ApiKey = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  user_id: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
};

const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      expires_at: "",
    },
  });

  // Load API keys
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить API ключи",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Create a new API key
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      const key = generateApiKey();
      const expiresAt = values.expires_at ? new Date(values.expires_at).toISOString() : null;
      
      const { data, error } = await supabase.from('api_keys').insert({
        name: values.name,
        description: values.description || null,
        key: key,
        user_id: user.id,
        expires_at: expiresAt,
        active: true,
      }).select();

      if (error) {
        throw error;
      }

      // Log API key creation
      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: 'api_key_created',
        details: {
          key_name: values.name,
        }
      });

      // Show the new API key to the user
      setNewApiKey(key);
      fetchApiKeys();
      form.reset();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать API ключ",
        variant: "destructive",
      });
    }
  };

  // Delete an API key
  const deleteApiKey = async (id: string, name: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Log API key deletion
      await logActivity({
        user_id: user.id,
        category: 'admin',
        action: 'api_key_deleted',
        details: {
          key_name: name,
        }
      });

      fetchApiKeys();
      toast({
        title: "Успешно",
        description: "API ключ удален",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить API ключ",
        variant: "destructive",
      });
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "API ключ скопирован в буфер обмена",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Ключи</h2>
        
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/admin/api-docs">
              <BookOpen size={16} />
              API Документация
            </Link>
          </Button>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Создать API ключ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый API ключ</DialogTitle>
                <DialogDescription>
                  API ключи позволяют внешним приложениям взаимодействовать с админ панелью.
                  Храните ключи в безопасном месте!
                </DialogDescription>
              </DialogHeader>

              {newApiKey ? (
                <div className="space-y-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-md">
                    <p className="font-bold mb-2">Сохраните этот ключ! Он будет показан только один раз.</p>
                    <div className="flex items-center gap-2">
                      <Input value={newApiKey} readOnly className="font-mono" />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(newApiKey)}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => {
                    setNewApiKey(null);
                    setOpenDialog(false);
                  }}>
                    Готово
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название</FormLabel>
                          <FormControl>
                            <Input placeholder="Название для идентификации ключа" {...field} />
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
                          <FormLabel>Описание (опционально)</FormLabel>
                          <FormControl>
                            <Input placeholder="Для чего используется этот ключ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expires_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Срок действия (опционально)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Оставьте пустым, если ключ не должен истекать
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Создать ключ</Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p>У вас пока нет API ключей</p>
          <p className="text-sm text-muted-foreground">
            Создайте ключ для взаимодействия внешних приложений с админ панелью
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead>Последнее использование</TableHead>
              <TableHead>Истекает</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{key.name}</div>
                    {key.description && (
                      <div className="text-sm text-muted-foreground">{key.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{format(new Date(key.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                <TableCell>
                  {key.last_used_at 
                    ? format(new Date(key.last_used_at), 'dd.MM.yyyy HH:mm')
                    : 'Никогда'}
                </TableCell>
                <TableCell>
                  {key.expires_at 
                    ? format(new Date(key.expires_at), 'dd.MM.yyyy')
                    : 'Не истекает'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => deleteApiKey(key.id, key.name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ApiKeysTab;
