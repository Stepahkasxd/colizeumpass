
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, Clock } from "lucide-react";

const PurchasesTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: purchases, isLoading, error, refetch } = useQuery({
    queryKey: ['user_purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*, product:products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const completePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', purchaseId)
        .select('*, product:products(name)')
        .single();

      if (error) throw error;
      if (!data) return null; // Return null if no data found
      return data;
    },
    onSuccess: (updatedPurchase) => {
      // Add safety check
      if (!updatedPurchase) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить статус покупки",
          variant: "destructive",
        });
        return;
      }

      // Update purchases in cache
      queryClient.setQueryData(['user_purchases', user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((purchase: any) => 
          purchase.id === updatedPurchase.id ? updatedPurchase : purchase
        );
      });

      logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'mark_purchase_completed',
        details: {
          purchase_id: updatedPurchase.id,
          product_name: updatedPurchase.product?.name,
        }
      });

      toast({
        title: "Товар получен",
        description: `Вы отметили товар "${updatedPurchase.product?.name}" как полученный.`,
      });

      refetch();
    },
    onError: (error) => {
      console.error("Error completing purchase:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отметить товар как полученный",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Получен</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Ожидает</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) return <div className="text-center py-8">Загрузка покупок...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Ошибка при загрузке покупок</div>;
  if (!purchases?.length) return <div className="text-center py-8">У вас пока нет покупок</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-yellow-400" />
        <h2 className="text-2xl font-bold">Ваши покупки</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="overflow-hidden border border-yellow-400/20 glass-card">
            <CardHeader className="pb-2">
              <CardTitle>{purchase.product?.name}</CardTitle>
              <CardDescription>
                {getStatusBadge(purchase.status)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{purchase.product?.description}</p>
              <p className="text-sm mt-2">Цена: {purchase.product?.price} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">
                Дата заказа: {new Date(purchase.created_at).toLocaleDateString()}
              </p>
            </CardContent>
            {purchase.status === 'pending' && (
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-yellow-400/20 hover:text-yellow-400"
                  onClick={() => completePurchaseMutation.mutate(purchase.id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Отметить как полученный
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PurchasesTab;
