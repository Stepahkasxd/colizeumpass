
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Product } from "../ProductsTab";

interface ProductListProps {
  products?: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductList = ({ products, isLoading, onEdit, onDelete }: ProductListProps) => {
  if (isLoading) {
    return <div className="text-center text-muted-foreground">Загрузка товаров...</div>;
  }

  if (!products?.length) {
    return <div className="text-center text-muted-foreground">Товары не найдены</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              {product.description}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">Стоимость в очках</p>
                <p className="text-lg">{product.points_cost}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Цена</p>
                <p className="text-lg">{product.price} ₽</p>
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${product.available ? 'text-green-500' : 'text-red-500'}`}>
                {product.available ? 'Доступен' : 'Недоступен'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
