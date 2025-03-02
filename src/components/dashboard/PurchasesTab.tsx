
// Update the completePurchaseMutation to handle possible undefined data:

// In the section where completePurchaseMutation is defined:
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
