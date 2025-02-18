
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BuyPassForm } from "@/components/passes/BuyPassForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BuyPass = () => {
  const { passId } = useParams();
  const navigate = useNavigate();

  const { data: pass, isLoading } = useQuery({
    queryKey: ['pass', passId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .eq('id', passId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!pass) {
    return <div>Пропуск не найден</div>;
  }

  return (
    <div className="container max-w-md py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div className="bg-card rounded-lg border p-6">
        <BuyPassForm
          passId={pass.id}
          passName={pass.name}
          amount={1000} // Здесь должна быть реальная цена из вашей системы
        />
      </div>
    </div>
  );
};

export default BuyPass;
