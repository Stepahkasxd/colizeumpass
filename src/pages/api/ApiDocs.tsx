import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiDocs = () => {
  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        API Документация
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Используйте наш API для интеграции с вашими приложениями
      </p>
      
      <Separator className="my-8" />
      
      <div className="space-y-10">
        <section>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Аутентификация
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>API ключи</CardTitle>
              <CardDescription>
                Все запросы к API должны включать ваш API ключ для аутентификации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Добавьте заголовок <code className="font-mono bg-muted px-1 py-0.5 rounded">x-api-key</code> с вашим API ключом к каждому запросу:
              </p>
              <div className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                <pre><code className="text-sm">
                  {`curl -X GET "https://example.com/api/endpoint" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </code></pre>
              </div>
              <p className="text-sm text-muted-foreground">
                API ключи можно создать и управлять ими в <a href="/admin" className="underline">панели администратора</a>.
              </p>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Эндпоинты API
          </h2>
          
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="passes">Пропуска</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>GET /api/users</CardTitle>
                  <CardDescription>
                    Получить список пользователей (только для администраторов)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры запроса</h4>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">limit</code> - Лимит результатов (по умолчанию 10)
                      </p>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">offset</code> - Смещение для пагинации
                      </p>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">search</code> - Поиск по имени пользователя
                      </p>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">has_pass</code> - Фильтр по наличию пропуска (true/false)
                      </p>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">status</code> - Фильтр по статусу пользователя
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "display_name": "Пользователь",
      "has_pass": true,
      "level": 2,
      "points": 150,
      "status": "Premium",
      "created_at": "2023-01-01T00:00:00Z",
      "is_admin": false,
      "phone_number": "+12345678901",
      "is_blocked": false
    }
  ],
  "total": 100
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>GET /api/users/:id</CardTitle>
                  <CardDescription>
                    Получить информацию о конкретном пользователе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры пути</h4>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">id</code> - ID пользователя
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Пользователь",
    "has_pass": true,
    "level": 2,
    "points": 150,
    "status": "Premium",
    "created_at": "2023-01-01T00:00:00Z",
    "is_admin": false,
    "email": "user@example.com",
    "phone_number": "+12345678901",
    "is_blocked": false,
    "free_points": 10,
    "bio": "Профиль пользователя",
    "last_sign_in_at": "2023-05-01T00:00:00Z"
  }
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>POST /api/users</CardTitle>
                  <CardDescription>
                    Создать нового пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Тело запроса</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                        <pre><code className="text-sm">
{`{
  "email": "newuser@example.com",
  "password": "secure_password",
  "display_name": "Новый пользователь",
  "phone_number": "+12345678901",
  "status": "Standard",
  "is_admin": false
}`}
                        </code></pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Новый пользователь",
    "has_pass": false,
    "level": 1,
    "points": 0,
    "status": "Standard",
    "is_admin": false,
    "email": "newuser@example.com",
    "phone_number": "+12345678901"
  },
  "message": "User created successfully"
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>PUT /api/users/:id</CardTitle>
                  <CardDescription>
                    Обновить данные пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры пути</h4>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">id</code> - ID пользователя
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Тело запроса</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Все поля необязательны. Отправляйте только те поля, которые хотите обновить.
                      </p>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                        <pre><code className="text-sm">
{`{
  "display_name": "Обновленное имя",
  "phone_number": "+10987654321",
  "level": 3,
  "points": 200,
  "status": "VIP",
  "has_pass": true,
  "is_blocked": false,
  "is_admin": true,
  "email": "updated@example.com"
}`}
                        </code></pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Обновленное имя",
    "has_pass": true,
    "level": 3,
    "points": 200,
    "status": "VIP",
    "is_admin": true,
    "email": "updated@example.com",
    "phone_number": "+10987654321",
    "is_blocked": false
  },
  "message": "User updated successfully"
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>DELETE /api/users/:id</CardTitle>
                  <CardDescription>
                    Удалить пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры пути</h4>
                      <p className="text-sm">
                        <code className="font-mono bg-muted px-1 py-0.5 rounded">id</code> - ID пользователя
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "message": "User deleted successfully"
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="passes">
              <Card>
                <CardHeader>
                  <CardTitle>GET /api/passes</CardTitle>
                  <CardDescription>
                    Получить список всех доступных пропусков
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры запроса</h4>
                      <p className="text-sm">Нет</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Стандартный пропуск",
      "description": "Базовый доступ ко всем функциям",
      "price": 2000,
      "levels": [
        { "id": 1, "name": "Уровень 1", "points": 100 },
        { "id": 2, "name": "Уровень 2", "points": 200 }
      ],
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>GET /api/passes/:id</CardTitle>
                  <CardDescription>
                    Получить информацию о конкретном пропуске
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Параметры пути</h4>
                      <p className="text-sm"><code className="font-mono bg-muted px-1 py-0.5 rounded">id</code> - ID пропуска</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Стандартный пропуск",
    "description": "Базовый доступ ко всем функциям",
    "price": 2000,
    "levels": [
      { "id": 1, "name": "Уровень 1", "points": 100 },
      { "id": 2, "name": "Уровень 2", "points": 200 }
    ],
    "created_at": "2023-01-01T00:00:00Z"
  }
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>GET /api/stats</CardTitle>
                  <CardDescription>
                    Получить общую статистику (только для администраторов)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Пример ответа</h4>
                      <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <pre><code className="text-sm">
{`{
  "data": {
    "total_users": 1250,
    "active_passes": 845,
    "revenue_total": 1690000,
    "revenue_monthly": 205000
  }
}`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
        
        <section>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Обработка ошибок
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Коды ошибок</CardTitle>
              <CardDescription>
                API использует стандартные HTTP-коды состояния для индикации успеха или неудачи запроса
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <th className="border px-4 py-2 text-left font-semibold">Код</th>
                    <th className="border px-4 py-2 text-left font-semibold">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">200 - OK</td>
                    <td className="border px-4 py-2 text-left">Запрос выполнен успешно</td>
                  </tr>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">400 - Bad Request</td>
                    <td className="border px-4 py-2 text-left">Ошибка в запросе</td>
                  </tr>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">401 - Unauthorized</td>
                    <td className="border px-4 py-2 text-left">Неверный или отсутствующий API ключ</td>
                  </tr>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">403 - Forbidden</td>
                    <td className="border px-4 py-2 text-left">Недостаточно прав для выполнения операции</td>
                  </tr>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">404 - Not Found</td>
                    <td className="border px-4 py-2 text-left">Ресурс не найден</td>
                  </tr>
                  <tr className="m-0 border-t p-0 even:bg-muted">
                    <td className="border px-4 py-2 text-left">500 - Internal Server Error</td>
                    <td className="border px-4 py-2 text-left">Ошибка сервера</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ApiDocs;
