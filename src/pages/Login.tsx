
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { logActivity } from "@/utils/logger";
import { 
  Card,
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимальная длина пароля - 6 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const testConnection = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    try {
      // Clear previous connection details
      setConnectionStatus(null);
      setConnectionSuccess(null);
      
      const result = await testSupabaseConnection();
      setConnectionSuccess(result.success);
      setConnectionStatus(result.message);
      setConnectionDetails(result);
      
      // Проверяем, офлайн ли мы
      if (result.offline) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
      
      if (!result.success && retryCount < 3) {
        // Автоматически пытаемся переподключиться 3 раза
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          testConnection();
        }, 3000); // Повторная попытка через 3 секунды
      }
    } catch (err) {
      console.error("Connection test error:", err);
      setConnectionSuccess(false);
      setConnectionStatus(`Критическая ошибка подключения: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    // Проверяем подключение к Supabase при монтировании компонента
    testConnection();

    // Добавляем слушатель события online/offline
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        // Если подключение восстановлено, проверяем подключение к Supabase
        testConnection();
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Handle offline mode specially
    if (isOffline) {
      toast({
        title: "Нет подключения к интернету",
        description: "Невозможно войти в систему без подключения к интернету",
        variant: "destructive",
      });
      return;
    }
    
    // Only check for success if we're not offline
    if (!isOffline && !connectionSuccess) {
      toast({
        title: "Ошибка подключения",
        description: "Невозможно выполнить вход без подключения к базе данных.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", values.email);
      
      // Try-catch to handle network errors
      let signInData, error;
      try {
        const response = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        signInData = response.data;
        error = response.error;
      } catch (networkError) {
        console.error("Network error during sign in:", networkError);
        toast({
          title: "Ошибка сети",
          description: "Не удалось подключиться к серверу авторизации. Проверьте ваше интернет-соединение.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Sign in response:", { data: signInData, error });

      if (error) {
        if (error.message.includes('not confirmed')) {
          toast({
            title: "Подтвердите email",
            description: "Пожалуйста, подтвердите ваш email перед входом. Проверьте почту.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка",
            description: `Неверный email или пароль. Детали: ${error.message}`,
            variant: "destructive",
          });
        }

        // Log failed login attempt - with error handling
        try {
          await logActivity({
            user_id: values.email, // In case of failed login, use email as identifier
            category: 'auth',
            action: 'login_failed',
            details: {
              email: values.email,
              error: error.message
            }
          });
        } catch (logError) {
          console.error("Error logging activity:", logError);
          // Don't show this error to the user, it's not critical
        }
        return;
      }

      if (signInData?.user) {
        // Log successful login - with error handling
        try {
          await logActivity({
            user_id: signInData.user.id,
            category: 'auth',
            action: 'login_success',
            details: {
              email: signInData.user.email
            }
          });
        } catch (logError) {
          console.error("Error logging activity:", logError);
          // Don't show this error to the user, it's not critical
        }

        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Colizeum!",
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Ошибка",
        description: `Произошла ошибка при входе: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для принудительного обновления соединения
  const handleRetryConnection = () => {
    setRetryCount(0);
    testConnection();
  };

  const renderConnectionStatus = () => {
    if (isOffline) {
      return (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Нет подключения к интернету</AlertTitle>
          <AlertDescription>
            Проверьте ваше соединение и попробуйте снова.
          </AlertDescription>
        </Alert>
      );
    }

    if (!connectionStatus) return null;

    return (
      <Alert 
        className={`mb-4 ${
          connectionSuccess 
            ? 'bg-green-900/50 text-green-200 border border-green-700' 
            : 'bg-red-900/50 text-red-200 border border-red-700'
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{connectionSuccess ? "Подключено" : "Ошибка подключения"}</AlertTitle>
        <div className="flex justify-between items-center w-full">
          <AlertDescription>
            {connectionStatus}
            {connectionDetails && connectionDetails.pingError && (
              <div className="mt-2 text-xs">
                Возможно, сервер Supabase недоступен или заблокирован. Попробуйте позже или используйте VPN.
              </div>
            )}
          </AlertDescription>
          {!connectionSuccess && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 h-8" 
              onClick={handleRetryConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </Alert>
    );
  };

  // Add offline mode detection
  const isFormEnabled = !isLoading && (connectionSuccess || isOffline);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-glow">
                Вход в Colizeum
              </CardTitle>
              <CardDescription className="text-center">
                Войдите в свой аккаунт для доступа к платформе
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {renderConnectionStatus()}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@mail.com"
                            type="email"
                            {...field}
                            disabled={isLoading || (!connectionSuccess && !isOffline)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading || (!connectionSuccess && !isOffline)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || (!connectionSuccess && !isOffline)}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isOffline ? "Войти (офлайн режим)" : "Войти"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
              
              {!connectionSuccess && !isOffline && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  <p>Если проблема не исчезает, возможно:</p>
                  <ul className="list-disc text-left pl-4 mt-1">
                    <li>Проблемы со стороны Supabase (сервис временно недоступен)</li>
                    <li>Ваше интернет-соединение блокирует доступ к API</li>
                    <li>Попробуйте использовать VPN для обхода блокировок</li>
                    <li>Необходимо очистить кэш браузера</li>
                  </ul>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
