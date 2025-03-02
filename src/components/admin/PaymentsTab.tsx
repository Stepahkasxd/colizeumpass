
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, AlertCircle, ShoppingBag } from "lucide-react";

const PaymentsTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: purchases, refetch: refetchPurchases } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, product:products(*)')
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    }
  });

  const updatePurchaseStatusMutation = useMutation({
    mutationFn: async ({ purchaseId, status }: { purchaseId: string; status: string }) => {
      const { data, error } = await supabase
        .from('purchases')
        .update({ status })
        .eq('id', purchaseId)
        .select('*, product:products(*)');

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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Управление платежами</h2>
      </div>
      
      {!purchases?.length ? (
        <div className="text-center py-6 text-muted-foreground">
          Нет ожидающих заказов
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{purchase.product?.name}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/20">
                    Ожидает
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1 text-sm mb-3">
                  <p>ID покупки: {purchase.id.substring(0, 8)}...</p>
                  <p>Пользователь ID: {purchase.user_id.substring(0, 8)}...</p>
                  <p>Дата: {new Date(purchase.created_at).toLocaleString()}</p>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => updatePurchaseStatusMutation.mutate({ 
                    purchaseId: purchase.id, 
                    status: 'completed'
                  })}
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Отметить как выполненный
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
