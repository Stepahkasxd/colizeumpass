
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Clock, Key, RefreshCw, Trash2 } from "lucide-react";
import { generateApiKey, getUserApiKeys, revokeApiKey, ApiKey } from "@/utils/apiKeyUtils";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function ApiKeysTab() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: apiKeys, isLoading, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const result = await getUserApiKeys();
      if (!result.success) {
        throw new Error('Failed to fetch API keys');
      }
      return result.data as ApiKey[];
    }
  });

  const handleCreateKey = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название ключа обязательно",
        variant: "destructive",
      });
      return;
    }

    const result = await generateApiKey(name, description || undefined);
    
    if (result.success && result.data) {
      setNewKey(result.data.key);
      toast({
        title: "Успех",
        description: "API ключ успешно создан",
      });
      setName('');
      setDescription('');
      refetch();
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось создать API ключ",
        variant: "destructive",
      });
    }
  };

  const handleRevokeKey = async (id: string) => {
    const result = await revokeApiKey(id);
    
    if (result.success) {
      toast({
        title: "Успех",
        description: "API ключ отозван",
      });
      refetch();
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось отозвать API ключ",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Ключи</h2>
          <p className="text-muted-foreground">Управление API ключами для внешних интеграций</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Key className="mr-2 h-4 w-4" />
              Создать API ключ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать API ключ</DialogTitle>
              <DialogDescription>
                API ключи позволяют внешним приложениям взаимодействовать с вашей учетной записью.
              </DialogDescription>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-300 text-sm mb-2 font-medium">
                    Сохраните этот ключ! Он будет показан только один раз.
                  </p>
                  <div className="bg-background p-3 rounded border">
                    <code className="text-xs break-all">{newKey}</code>
                  </div>
                </div>
                <Button onClick={() => {
                  setIsCreateOpen(false);
                  setNewKey(null);
                }} className="w-full">Готово</Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Например: Мобильное приложение"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание (необязательно)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Для чего будет использоваться этот ключ"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateKey}>Создать ключ</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted/50"></CardHeader>
              <CardContent className="h-12 bg-muted/30"></CardContent>
            </Card>
          ))}
        </div>
      ) : !apiKeys || apiKeys.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <Key className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <h3 className="font-medium text-lg mb-1">Нет API ключей</h3>
            <p className="text-muted-foreground mb-4">Создайте API ключ для доступа к вашей учетной записи из внешних приложений.</p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              <Key className="mr-2 h-4 w-4" />
              Создать API ключ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {key.name}
                      <Badge variant={key.status === 'active' ? 'default' : 'destructive'} className="ml-2">
                        {key.status === 'active' ? 'Активен' : 'Отозван'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{key.description || 'Нет описания'}</CardDescription>
                  </div>
                  {key.status === 'active' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRevokeKey(key.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="inline-flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Создан:
                    </span>
                    <span>{formatDate(key.created_at)}</span>
                  </div>
                  {key.last_used_at && (
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Последнее использование:
                      </span>
                      <span>{formatDate(key.last_used_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="text-xs text-muted-foreground">
                  ID: {key.id}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Документация по API</CardTitle>
          <CardDescription>
            Узнайте, как интегрировать свои приложения с нашим API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Для аутентификации добавьте заголовок <code>x-api-key</code> с вашим API ключом к запросам.
            Подробную документацию и примеры вы можете найти в разделе API документации.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="/api/docs">Перейти к документации API</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
