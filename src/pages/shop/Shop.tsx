
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  available: boolean;
};

type UserProfile = {
  free_points: number;
};

const Shop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Получаем список товаров
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('points_cost', { ascending: true });

      if (error) throw error;
      return data as Product[];
    }
  });

  // Получаем баланс пользователя
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('free_points')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id
  });

  // Обработчик покупки товара
  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Для покупки товаров необходимо войти в систему",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!profile || profile.free_points < product.points_cost) {
      toast({
        title: "Недостаточно очков",
        description: "У вас недостаточно свободных очков для покупки этого товара",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          free_points: profile.free_points - product.points_cost
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Успешная покупка",
        description: `Вы успешно приобрели ${product.name}`,
      });

      refetchProfile();
    } catch (error) {
      toast({
        title: "Ошибка при покупке",
        description: "Не удалось совершить покупку. Попробуйте позже",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container pt-24 pb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Магазин</h1>
          <p className="text-muted-foreground mb-4">
            Для доступа к магазину необходимо войти в систему
          </p>
          <Button onClick={() => navigate("/login")}>
            Войти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Магазин</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Ваш баланс</p>
          <p className="text-2xl font-bold">{profile?.free_points || 0} очков</p>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className="text-center text-muted-foreground">
          Загрузка товаров...
        </div>
      ) : !products?.length ? (
        <div className="text-center text-muted-foreground">
          В магазине пока нет доступных товаров
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                {product.description && (
                  <CardDescription>{product.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {product.points_cost} очков
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(product)}
                  disabled={!profile || profile.free_points < product.points_cost}
                >
                  {!profile || profile.free_points < product.points_cost 
                    ? "Недостаточно очков" 
                    : "Купить"
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
