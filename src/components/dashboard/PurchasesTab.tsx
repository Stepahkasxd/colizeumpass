
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

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
      return data as Purchase[];
    },
    enabled: !!user?.id
  });

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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
