
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

type BuyPassFormProps = {
  passId: string;
  passName: string;
  amount: number;
};

export const BuyPassForm = ({ passId, passName, amount }: BuyPassFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userHasPass, setUserHasPass] = useState(false);
  const [isCheckingPass, setIsCheckingPass] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserPass = async () => {
      if (!user) {
        setIsCheckingPass(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_pass')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setUserHasPass(data.has_pass || false);
      } catch (error) {
        console.error('Error checking user pass status:', error);
      } finally {
        setIsCheckingPass(false);
      }
    };

    checkUserPass();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      // Преобразуем номер телефона в формат без пробелов и с префиксом +7
      const formattedPhoneNumber = phoneNumber.replace(/\s/g, '');
      
      const { error } = await supabase
        .from('payment_requests')
        .insert([
          {
            user_id: user.id,
            pass_id: passId,
            phone_number: formattedPhoneNumber,
            amount: amount,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Заявка создана. Сейчас вы получите инструкцию по оплате",
      });

      navigate("/passes/instructions");
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявку на покупку",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const numbers = value.replace(/\D/g, '');
    
    // Форматируем номер как +7 XXX XXX XX XX
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7 ${numbers}`;
    if (numbers.length <= 4) return `+7 ${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    return `+7 ${numbers.slice(1, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 9)} ${numbers.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  if (isCheckingPass) {
    return <div className="flex justify-center p-4">Проверка статуса пропуска...</div>;
  }

  if (userHasPass) {
    return (
      <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
        <div className="flex items-center gap-2 text-primary mb-3">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">У вас уже есть активный пропуск</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Вы уже приобрели пропуск. Перейдите в раздел "Личный кабинет" для просмотра информации о вашем пропуске.
        </p>
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={() => navigate("/dashboard")}
        >
          Перейти в личный кабинет
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Оплата пропуска "{passName}"</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Сумма к оплате: {amount} ₽
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Номер телефона
        </label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="+7 999 999 99 99"
          required
          pattern="^\+7 \d{3} \d{3} \d{2} \d{2}$"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Отправка..." : "Отправить заявку"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        После отправки заявки вы получите инструкцию по оплате пропуска.
      </p>
    </form>
  );
};
