
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const formSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимальная длина пароля - 6 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Test connection to Supabase on component mount
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          console.error("Supabase connection test error:", error);
          setConnectionStatus(`Ошибка подключения: ${error.message}`);
        } else {
          setConnectionStatus("Подключение к базе данных установлено");
          console.log("Supabase connection test successful:", data);
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setConnectionStatus(`Ошибка подключения: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", values.email);
      
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

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

        // Log failed login attempt
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
        }
        return;
      }

      if (signInData?.user) {
        // Log successful login
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
        description: `Произошла ошибка при входе: ${error.message || "Неизвестная ошибка"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 rounded-lg"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-glow">
            Вход в Colizeum
          </h1>

          {connectionStatus && (
            <div className={`mb-4 p-3 text-sm rounded ${connectionStatus.includes('Ошибка') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
              {connectionStatus}
            </div>
          )}

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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
