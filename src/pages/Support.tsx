
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  subject: z.string().min(5, "Тема должна содержать минимум 5 символов"),
  message: z.string().min(20, "Сообщение должно содержать минимум 20 символов"),
});

type FormValues = z.infer<typeof formSchema>;

const Support = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Необходима авторизация",
          description: "Пожалуйста, войдите в систему чтобы отправить обращение",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject: values.subject,
        message: values.message,
      });

      if (error) throw error;

      toast({
        title: "Обращение отправлено",
        description: "Мы ответим вам в ближайшее время",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить обращение. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 rounded-lg"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-glow">
            Техническая поддержка
          </h1>
          <p className="text-foreground/70 text-center mb-8">
            Если у вас возникли вопросы или предложения, напишите нам. Мы ответим в ближайшее время.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тема обращения</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: Вопрос по пропуску"
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сообщение</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите ваш вопрос подробнее..."
                        className="min-h-[150px] resize-none"
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
                Отправить
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
