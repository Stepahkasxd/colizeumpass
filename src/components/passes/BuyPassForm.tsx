
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type BuyPassFormProps = {
  passId: string;
  passName: string;
  amount: number;
};

export const BuyPassForm = ({ passId, passName, amount }: BuyPassFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      const { error } = await supabase
        .from('payment_requests')
        .insert([
          {
            user_id: user.id,
            pass_id: passId,
            phone_number: phoneNumber,
            amount: amount,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Заявка на покупку пропуска отправлена",
      });

      navigate("/");
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
        После отправки заявки администратор рассмотрит её и свяжется с вами для подтверждения оплаты.
      </p>
    </form>
  );
};
