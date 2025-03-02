import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ProductList } from "./products/ProductList.tsx";
import { ProductForm } from "./products/ProductForm.tsx";
import { useAuth } from "@/context/AuthContext";
import { logActivity } from "@/utils/logger";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  price: number;
  available: boolean;
  created_at: string;
};

const ProductsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    }
  });

  const handleCreateProduct = async (data: Omit<Product, 'id' | 'created_at'>) => {
    if (!user) return;
    
    try {
      const { error, data: newProduct } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          description: data.description,
          points_cost: data.points_cost,
          price: data.price,
          available: data.available
        }])
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'create_product',
        details: {
          product_id: newProduct.id,
          product_name: data.name,
          points_cost: data.points_cost,
          price: data.price
        }
      });

      toast({
        title: "Успех",
        description: "Товар успешно создан",
      });

      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать товар",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: Product) => {
    if (!user) return;
    
    try {
      const originalProduct = products?.find(p => p.id === data.id);
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          points_cost: data.points_cost,
          price: data.price,
          available: data.available
        })
        .eq('id', data.id);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'update_product',
        details: {
          product_id: data.id,
          product_name: data.name,
          changes: {
            name: data.name !== originalProduct?.name ? 
              { from: originalProduct?.name, to: data.name } : undefined,
            points_cost: data.points_cost !== originalProduct?.points_cost ? 
              { from: originalProduct?.points_cost, to: data.points_cost } : undefined,
            price: data.price !== originalProduct?.price ? 
              { from: originalProduct?.price, to: data.price } : undefined,
            available: data.available !== originalProduct?.available ? 
              { from: originalProduct?.available, to: data.available } : undefined
          }
        }
      });

      toast({
        title: "Успех",
        description: "Товар успешно обновлен",
      });

      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    
    try {
      const productToDelete = products?.find(p => p.id === id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        user_id: user.id,
        category: 'shop',
        action: 'delete_product',
        details: {
          product_id: id,
          product_name: productToDelete?.name,
          points_cost: productToDelete?.points_cost,
          price: productToDelete?.price
        }
      });

      toast({
        title: "Успех",
        description: "Товар успешно удален",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Управление товарами</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать товар
        </Button>
      </div>

      <ProductList
        products={products}
        isLoading={isLoading}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать товар</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreateProduct}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTab;
