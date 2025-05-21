
import { useState } from "react";
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
import { 
  Card,
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимальная длина пароля - 6 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        setIsLoading(false);
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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Войти
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
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
