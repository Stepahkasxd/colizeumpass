
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const ApiDocs = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        return navigate("/login");
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (error || !data) {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет прав администратора",
            variant: "destructive",
          });
          return navigate("/");
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin role:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Код скопирован в буфер обмена",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">API Документация</h1>
        <Button onClick={() => navigate("/admin")}>Назад к панели управления</Button>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Введение</h2>
          <p>
            API Colizeum позволяет взаимодействовать с административной панелью через HTTP запросы.
            Для использования API вам необходимо создать API ключ в административной панели.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Аутентификация</h2>
          <p>
            Все запросы к API должны включать ваш API ключ в заголовке <code>x-api-key</code>.
          </p>
          <div className="bg-secondary/30 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <pre>X-API-Key: YOUR_API_KEY</pre>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard("X-API-Key: YOUR_API_KEY")}>
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Базовый URL</h2>
          <p>Базовый URL для всех запросов API:</p>
          <div className="bg-secondary/30 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <pre>https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api</pre>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard("https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api")}>
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Доступные эндпоинты</h2>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Получение списка пользователей</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">GET</span>
                <code>/users</code>
              </div>
              <p>Возвращает список всех пользователей системы.</p>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Пример запроса:</h4>
                <div className="bg-secondary/30 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <pre>curl -X GET https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api/users \
-H "x-api-key: YOUR_API_KEY"</pre>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('curl -X GET https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api/users \\\n-H "x-api-key: YOUR_API_KEY"')}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Пример ответа:</h4>
                <div className="bg-secondary/30 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <pre>{JSON.stringify({
                      data: [
                        {
                          id: "user-id-1",
                          display_name: "Иван Иванов",
                          status: "Standard",
                          level: 5,
                          points: 1250,
                          has_pass: true,
                          // ...
                        },
                        // ...
                      ]
                    }, null, 2)}</pre>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(JSON.stringify({
                      data: [
                        {
                          id: "user-id-1",
                          display_name: "Иван Иванов",
                          status: "Standard",
                          level: 5,
                          points: 1250,
                          has_pass: true,
                        },
                      ]
                    }, null, 2))}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Получение списка пропусков</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">GET</span>
                <code>/passes</code>
              </div>
              <p>Возвращает список всех пропусков в системе.</p>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Пример запроса:</h4>
                <div className="bg-secondary/30 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <pre>curl -X GET https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api/passes \
-H "x-api-key: YOUR_API_KEY"</pre>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('curl -X GET https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/admin-api/passes \\\n-H "x-api-key: YOUR_API_KEY"')}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Пример ответа:</h4>
                <div className="bg-secondary/30 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <pre>{JSON.stringify({
                      data: [
                        {
                          id: "pass-id-1",
                          name: "Боевой пропуск",
                          description: "Сезонный пропуск с наградами",
                          price: 1500,
                          levels: [
                            { level: 1, points_required: 100, rewards: {} },
                            // ...
                          ]
                        },
                        // ...
                      ]
                    }, null, 2)}</pre>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(JSON.stringify({
                      data: [
                        {
                          id: "pass-id-1",
                          name: "Боевой пропуск",
                          description: "Сезонный пропуск с наградами",
                          price: 1500,
                          levels: [
                            { level: 1, points_required: 100, rewards: {} },
                          ]
                        },
                      ]
                    }, null, 2))}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Коды ошибок</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                <th className="border p-2 text-left">Код</th>
                <th className="border p-2 text-left">Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">401</td>
                <td className="border p-2">Неверный или отсутствующий API ключ</td>
              </tr>
              <tr>
                <td className="border p-2">403</td>
                <td className="border p-2">Недостаточно прав для выполнения операции</td>
              </tr>
              <tr>
                <td className="border p-2">404</td>
                <td className="border p-2">Ресурс не найден</td>
              </tr>
              <tr>
                <td className="border p-2">405</td>
                <td className="border p-2">Метод не поддерживается</td>
              </tr>
              <tr>
                <td className="border p-2">500</td>
                <td className="border p-2">Внутренняя ошибка сервера</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default ApiDocs;
