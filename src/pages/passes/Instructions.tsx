
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Instructions = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        На главную
      </Button>

      <div className="bg-card rounded-lg border p-8 space-y-6">
        <h1 className="text-2xl font-bold">Инструкция по оплате пропуска</h1>
        
        <div className="space-y-4">
          <p>
            Ваша заявка на покупку пропуска создана. Для завершения процесса:
          </p>
          
          <ol className="list-decimal list-inside space-y-2">
            <li>Подойдите к администратору Colizeum</li>
            <li>Предъявите ваш ID пользователя</li>
            <li>Оплатите стоимость пропуска</li>
          </ol>

          <p className="text-sm text-muted-foreground">
            После подтверждения оплаты администратором, пропуск будет автоматически активирован на вашем аккаунте.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
