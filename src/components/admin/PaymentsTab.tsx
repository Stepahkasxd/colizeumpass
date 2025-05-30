
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logActivity } from "@/utils/logger";
import { useAuth } from "@/context/AuthContext";

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

type PaymentRequest = {
  id: string;
  user_id: string;
  phone_number: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  pass_id: string | null;
  admin_notes: string | null;
  passes?: {
    name: string;
  } | null;
};

const STATUS_LABELS = {
  pending: 'Ожидает оплаты',
  approved: 'Оплачено',
  rejected: 'Отклонено'
} as const;

const PaymentsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests, isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['payment_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*, passes(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentRequest[];
    }
  });

  // Mutation for updating payment request status
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, newStatus }: { requestId: string; newStatus: PaymentRequest['status'] }) => {
      const { error } = await supabase
        .from('payment_requests')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (error) throw error;
      return { requestId, newStatus };
    },
    onSuccess: async ({ requestId, newStatus }) => {
      if (!user) return;
      
      const request = requests?.find(r => r.id === requestId);
      if (!request) return;

      if (newStatus === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            has_pass: true
          })
          .eq('id', request.user_id);

        if (profileError) throw profileError;

        await logActivity({
          user_id: request.user_id,
          category: 'passes',
          action: 'pass_approved',
          details: {
            pass_id: request.pass_id,
            pass_name: request.passes?.name,
            amount: request.amount,
            admin_id: user.id,
            admin_notes: adminNotes
          }
        });
      } else if (newStatus === 'rejected') {
        await logActivity({
          user_id: request.user_id,
          category: 'passes',
          action: 'pass_rejected',
          details: {
            pass_id: request.pass_id,
            pass_name: request.passes?.name,
            amount: request.amount,
            admin_id: user.id,
            admin_notes: adminNotes,
            reason: adminNotes || 'No reason provided'
          }
        });
      }

      toast({
        title: "Статус обновлен",
        description: "Статус заявки успешно обновлен",
      });

      setSelectedRequest(null);
      refetchRequests();
    },
    onError: (error) => {
      console.error('Error updating payment request status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заявки",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (requestId: string, newStatus: PaymentRequest['status']) => {
    updateRequestStatusMutation.mutate({ requestId, newStatus });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: PaymentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const PaymentRequestsList = ({ requests }: { requests: PaymentRequest[] }) => (
    <div className="grid gap-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">
                Пропуск: {request.passes?.name ?? 'Удален'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Телефон: {request.phone_number}
              </p>
              <p className="text-sm text-muted-foreground">
                Сумма: {formatAmount(request.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Создана: {formatDate(request.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(request);
                  setAdminNotes(request.admin_notes || "");
                }}
              >
                Подробнее
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
              {STATUS_LABELS[request.status]}
            </span>
            {request.updated_at !== request.created_at && (
              <span className="text-sm text-muted-foreground">
                · Обновлена: {formatDate(request.updated_at)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const activeRequests = requests?.filter(r => r.status === 'pending') || [];
  const archivedRequests = requests?.filter(r => r.status === 'approved' || r.status === 'rejected') || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Управление платежами</h2>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Активные
            {activeRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                {activeRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archive">
            Архив
            {archivedRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                {archivedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoadingRequests ? (
            <div>Загрузка заявок...</div>
          ) : (
            <PaymentRequestsList requests={activeRequests} />
          )}
        </TabsContent>

        <TabsContent value="archive">
          {isLoadingRequests ? (
            <div>Загрузка заявок...</div>
          ) : (
            <PaymentRequestsList requests={archivedRequests} />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали заявки на оплату</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Информация о заявке
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>ID пользователя: {selectedRequest.user_id}</p>
                    <p>Телефон: {selectedRequest.phone_number}</p>
                    <p>Сумма: {formatAmount(selectedRequest.amount)}</p>
                    <p>Создана: {formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Заметки администратора:</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Добавьте заметки по заявке..."
                    className="h-32"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Статус:</span>
                    <Select
                      defaultValue={selectedRequest.status}
                      onValueChange={(value) => handleStatusChange(selectedRequest.id, value as PaymentRequest['status'])}
                      disabled={updateRequestStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedRequest.updated_at !== selectedRequest.created_at && (
                    <span className="text-sm text-muted-foreground">
                      Последнее обновление: {formatDate(selectedRequest.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsTab;
