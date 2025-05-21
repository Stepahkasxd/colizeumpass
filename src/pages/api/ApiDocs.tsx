
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
                  {`curl -X GET "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys" \\
  -H "x-api-key: YOUR_API_KEY"`}
                </code></pre>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                API ключи можно создать и управлять ими в <a href="/admin" className="underline">панели администратора</a>.
              </p>
              
              <h3 className="text-lg font-semibold mb-2">Шаги для использования API ключей:</h3>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Сгенерируйте API ключ в <a href="/admin" className="underline">панели администратора</a></li>
                <li>Сохраните полученный ключ (он показывается только один раз)</li>
                <li>Используйте ключ в заголовке <code className="font-mono bg-muted px-1 py-0.5 rounded">x-api-key</code> для всех запросов к API</li>
                <li>Для административных действий убедитесь, что ваш пользователь имеет права администратора</li>
              </ol>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Эндпоинты API ключей
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Управление API ключами</CardTitle>
              <CardDescription>
                Эти эндпоинты позволяют взаимодействовать с API ключами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">GET /functions/v1/api-keys-api/keys</h3>
                <p className="text-muted-foreground mb-2">Получить список всех ваших API ключей</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X GET "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys" \\
  -H "x-api-key: YOUR_API_KEY"`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Мой API ключ",
      "description": "Для мобильного приложения",
      "key": "abcdef1234567890...",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2023-01-01T00:00:00Z",
      "last_used_at": "2023-01-02T00:00:00Z",
      "expires_at": null,
      "status": "active"
    }
  ]
}`}
                    </code></pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">GET /functions/v1/api-keys-api/keys/:id</h3>
                <p className="text-muted-foreground mb-2">Получить информацию о конкретном API ключе по ID</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X GET "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys/550e8400-e29b-41d4-a716-446655440000" \\
  -H "x-api-key: YOUR_API_KEY"`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Мой API ключ",
    "description": "Для мобильного приложения",
    "key": "abcdef1234567890...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2023-01-01T00:00:00Z",
    "last_used_at": "2023-01-02T00:00:00Z",
    "expires_at": null,
    "status": "active"
  }
}`}
                    </code></pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">POST /functions/v1/api-keys-api/keys</h3>
                <p className="text-muted-foreground mb-2">Создать новый API ключ</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X POST "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Новый API ключ",
    "description": "Описание нового ключа",
    "expires_at": "2024-12-31T23:59:59Z"
  }'`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Параметры</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-1 text-left">Параметр</th>
                        <th className="py-2 px-1 text-left">Тип</th>
                        <th className="py-2 px-1 text-left">Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>name</code></td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">Обязательное. Название API ключа</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>description</code></td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">Необязательное. Описание API ключа</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>expires_at</code></td>
                        <td className="py-2 px-1">string (ISO 8601)</td>
                        <td className="py-2 px-1">Необязательное. Дата истечения срока действия ключа</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 mt-3">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Новый API ключ",
    "description": "Описание нового ключа",
    "key": "abcdef1234567890...", 
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2023-01-01T00:00:00Z",
    "last_used_at": null,
    "expires_at": "2024-12-31T23:59:59Z",
    "status": "active"
  },
  "message": "API key created successfully"
}`}
                    </code></pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">DELETE /functions/v1/api-keys-api/keys/:id</h3>
                <p className="text-muted-foreground mb-2">Отозвать API ключ</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X DELETE "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys/550e8400-e29b-41d4-a716-446655440000" \\
  -H "x-api-key: YOUR_API_KEY"`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "message": "API key revoked successfully"
}`}
                    </code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Административные эндпоинты API ключей</CardTitle>
              <CardDescription>
                Эти эндпоинты доступны только пользователям с правами администратора
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">GET /functions/v1/api-keys-api/admin/keys</h3>
                <p className="text-muted-foreground mb-2">Получить список всех API ключей в системе (только для администраторов)</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X GET "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/admin/keys" \\
  -H "x-api-key: YOUR_ADMIN_API_KEY"`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Параметры запроса</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-1 text-left">Параметр</th>
                        <th className="py-2 px-1 text-left">Тип</th>
                        <th className="py-2 px-1 text-left">Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>limit</code></td>
                        <td className="py-2 px-1">number</td>
                        <td className="py-2 px-1">Лимит результатов (по умолчанию 50)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>offset</code></td>
                        <td className="py-2 px-1">number</td>
                        <td className="py-2 px-1">Смещение для пагинации</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>search</code></td>
                        <td className="py-2 px-1">string</td>
                        <td className="py-2 px-1">Поиск по названию ключа</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>active</code></td>
                        <td className="py-2 px-1">boolean</td>
                        <td className="py-2 px-1">Фильтр по активности ключа (true/false)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 mt-3">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "API ключ пользователя",
      "description": "Для мобильного приложения",
      "key": "abcdef1234567890...",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_name": "Имя Пользователя",
      "created_at": "2023-01-01T00:00:00Z",
      "last_used_at": "2023-01-02T00:00:00Z",
      "expires_at": null,
      "status": "active"
    }
  ],
  "total": 100
}`}
                    </code></pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">GET /functions/v1/api-keys-api/admin/keys/:id</h3>
                <p className="text-muted-foreground mb-2">Получить информацию о конкретном API ключе (только для администраторов)</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X GET "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/admin/keys/550e8400-e29b-41d4-a716-446655440000" \\
  -H "x-api-key: YOUR_ADMIN_API_KEY"`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "API ключ пользователя",
    "description": "Для мобильного приложения",
    "key": "abcdef1234567890...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_name": "Имя Пользователя",
    "created_at": "2023-01-01T00:00:00Z",
    "last_used_at": "2023-01-02T00:00:00Z",
    "expires_at": null,
    "status": "active"
  }
}`}
                    </code></pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">PUT /functions/v1/api-keys-api/admin/keys/:id</h3>
                <p className="text-muted-foreground mb-2">Обновить статус API ключа (только для администраторов)</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-3">
                  <pre><code className="text-sm">
{`curl -X PUT "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/admin/keys/550e8400-e29b-41d4-a716-446655440000" \\
  -H "x-api-key: YOUR_ADMIN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "active": false
  }'`}
                  </code></pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Параметры</h4>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-1 text-left">Параметр</th>
                        <th className="py-2 px-1 text-left">Тип</th>
                        <th className="py-2 px-1 text-left">Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-1"><code>active</code></td>
                        <td className="py-2 px-1">boolean</td>
                        <td className="py-2 px-1">Обязательное. Новый статус активности ключа</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 mt-3">
                  <h4 className="font-medium">Ответ</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre><code className="text-sm">
{`{
  "message": "API key revoked successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "API ключ пользователя",
    "status": "revoked"
  }
}`}
                    </code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Примеры использования API ключей
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Руководство по интеграции</CardTitle>
              <CardDescription>
                Пошаговые инструкции по использованию API ключей для доступа к API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Генерация API ключа</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Войдите в <a href="/admin" className="underline">панель администратора</a></li>
                  <li>Перейдите в раздел "API ключи"</li>
                  <li>Нажмите "Создать API ключ"</li>
                  <li>Введите название и описание ключа</li>
                  <li>Нажмите "Создать ключ"</li>
                  <li>Скопируйте сгенерированный ключ (показывается только один раз)</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Использование API ключа в запросах</h3>
                <p className="mb-2">
                  Добавьте заголовок <code className="font-mono bg-muted px-1 py-0.5 rounded">x-api-key</code> с вашим API ключом к каждому запросу:
                </p>
                <div className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                  <pre><code className="text-sm">
{`// JavaScript пример
async function fetchApiData() {
  const response = await fetch(
    "https://lmgfzqaewmenlmawdrxn.supabase.co/functions/v1/api-keys-api/keys", 
    {
      headers: {
        "x-api-key": "YOUR_API_KEY",
        "Content-Type": "application/json"
      }
    }
  );
  
  const data = await response.json();
  return data;
}`}
                  </code></pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Доступ к административным функциям</h3>
                <p className="mb-2">
                  Для доступа к административным эндпоинтам необходимо:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Ваш пользователь должен иметь роль администратора в системе</li>
                  <li>Используйте API ключ, принадлежащий пользователю с правами администратора</li>
                  <li>Административные эндпоинты начинаются с <code className="font-mono bg-muted px-1 py-0.5 rounded">/functions/v1/api-keys-api/admin/...</code></li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">4. Работа с ответами API</h3>
                <p className="mb-2">
                  Все ответы API имеют стандартную структуру:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Успешные запросы возвращают <code className="font-mono bg-muted px-1 py-0.5 rounded">data</code> с результатом</li>
                  <li>Ошибки возвращают <code className="font-mono bg-muted px-1 py-0.5 rounded">error</code> с сообщением</li>
                  <li>Некоторые запросы возвращают <code className="font-mono bg-muted px-1 py-0.5 rounded">message</code> с информацией о результате</li>
                  <li>Запросы с пагинацией могут возвращать <code className="font-mono bg-muted px-1 py-0.5 rounded">total</code> с общим количеством</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">5. Безопасность API ключей</h3>
                <p className="mb-2">
                  Соблюдайте следующие рекомендации:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Никогда не публикуйте API ключи в общедоступных репозиториях</li>
                  <li>Храните API ключи в безопасном месте</li>
                  <li>Используйте срок действия ключей для временного доступа</li>
                  <li>Периодически обновляйте ключи для повышения безопасности</li>
                  <li>При подозрении на компрометацию немедленно отзывайте ключи</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section id="other-api-endpoints">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            Прочие эндпоинты API
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
                    <td className="border px-4 py-2 text-left">201 - Created</td>
                    <td className="border px-4 py-2 text-left">Ресурс успешно создан</td>
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
              
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-medium">Специфичные ошибки API ключей</h3>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre><code className="text-sm">
{`// API ключ отсутствует в заголовке
{
  "error": "Missing API key"
}

// API ключ недействительный или отозванный
{
  "error": "Invalid API key"
}

// API ключ истек
{
  "error": "API key has expired"
}

// Пользователь не имеет прав администратора для доступа
{
  "error": "Unauthorized. Admin access required."
}

// API ключ не найден
{
  "error": "API key not found"
}

// Отсутствует обязательное поле
{
  "error": "API key name is required"
}`}
                  </code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ApiDocs;

