
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/logger";
import { Button } from "@/components/ui/button";

const PaymentsTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: purchases, refetch: refetchPurchases } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, product:products(name)')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    }
  });

  const updatePurchaseStatusMutation = useMutation({
    mutationFn: async ({ purchaseId, status, productId }: { purchaseId: string; status: string; productId: string }) => {
      const { data, error } = await supabase
        .from('purchases')
        .update({ status })
        .eq('id', purchaseId)
        .select();

      if (error) throw error;
      return data?.[0]; // Return the first element if data exists, otherwise undefined
    },
    onSuccess: async (updatedPurchase) => {
      // Add proper null/undefined checking for the response
      if (!updatedPurchase) {
        console.error("Error updating purchase status: No data received from update operation");
        toast({
          title: "Ошибка",
          description: "Не удалось обновить статус покупки",
          variant: "destructive",
        });
        return;
      }
      
      queryClient.setQueryData(['purchases'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((purchase: any) => 
          purchase.id === updatedPurchase.id ? updatedPurchase : purchase
        );
      });

      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'update_purchase_status',
        details: {
          purchase_id: updatedPurchase.id,
          new_status: updatedPurchase.status,
          product_id: updatedPurchase.product_id,
        }
      });

      toast({
        title: "Успех",
        description: "Статус покупки обновлен",
      });

      refetchPurchases();
    },
    onError: (error) => {
      console.error("Error updating purchase status:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус покупки",
        variant: "destructive",
      });
    }
  });

  return (
    <div>
      <h2 className="text-xl font-semibold">Управление платежами</h2>
      {purchases?.map((purchase) => (
        <div key={purchase.id} className="flex justify-between items-center">
          <span>{purchase.product?.name}</span>
          <Button onClick={() => updatePurchaseStatusMutation.mutate({ 
            purchaseId: purchase.id, 
            status: 'completed', 
            productId: purchase.product_id 
          })}>
            Завершить
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PaymentsTab;
