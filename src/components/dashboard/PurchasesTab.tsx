import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { logActivity } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

type Purchase = {
  id: string;
  created_at: string;
  status: string;
  product_id: string;
  products: {
    name: string;
    description: string | null;
    points_cost: number;
  };
};

export const PurchasesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for completing a purchase
  const completePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', purchaseId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    onSuccess: async (updatedPurchase) => {
      if (!updatedPurchase || !user) return;

      // Safely update the local cache
      queryClient.setQueryData(['purchases', user.id], (oldData: Purchase[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(purchase => 
          purchase.id === updatedPurchase.id 
            ? { ...purchase, status: 'completed' } 
            : purchase
        );
      });

      // Log the activity
      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'purchase_completed_by_user',
        details: {
          purchase_id: updatedPurchase.id
        }
      });

      toast({
        title: "Получено",
        description: "Статус покупки успешно обновлен",
      });
    },
    onError: (error) => {
      console.error('Error completing purchase:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус покупки",
        variant: "destructive",
      });
    }
  });

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          created_at,
          status,
          product_id,
          products (
            name,
            description,
            points_cost
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Логируем просмотр истории покупок
      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'view_purchase_history',
        details: {
          purchases_count: data?.length || 0
        }
      });

      return data as Purchase[];
    },
    enabled: !!user?.id
  });

  const handleMarkAsReceived = async (purchaseId: string) => {
    completePurchaseMutation.mutate(purchaseId);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Загрузка покупок...</div>;
  }

  if (!purchases?.length) {
    return (
      <div className="text-center text-muted-foreground">
        У вас пока нет покупок
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <Card key={purchase.id}>
          <CardHeader>
            <CardTitle>{purchase.products.name}</CardTitle>
            {purchase.products.description && (
              <CardDescription>{purchase.products.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Стоимость</p>
                <p className="font-bold">{purchase.products.points_cost} очков</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Статус</p>
                <p className={`font-medium ${
                  purchase.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {purchase.status === 'completed' ? 'Получено' : 'Ожидает получения'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата покупки</p>
                <p className="font-medium">
                  {format(new Date(purchase.created_at), 'dd.MM.yyyy HH:mm')}
                </p>
              </div>
            </div>
            
            {purchase.status === 'pending' && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleMarkAsReceived(purchase.id)}
                  disabled={completePurchaseMutation.isPending}
                >
                  {completePurchaseMutation.isPending ? "Обновление..." : "Отметить как полученный"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
