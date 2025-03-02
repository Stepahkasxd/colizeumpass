
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, User, Phone, Mail, Calendar, Shield, Award, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export const ProfileTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;

      setDisplayName(data.display_name || "");
      setPhoneNumber(data.phone_number || "");
      setBio(data.bio || "");

      return data;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { display_name: string; phone_number: string; bio: string }) => {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.display_name,
          phone_number: profileData.phone_number,
          bio: profileData.bio
        })
        .eq('id', profile?.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      display_name: displayName,
      phone_number: phoneNumber,
      bio: bio
    });
  };

  const cancelEditing = () => {
    setDisplayName(profile?.display_name || "");
    setPhoneNumber(profile?.phone_number || "");
    setBio(profile?.bio || "");
    setIsEditing(false);
  };

  const accountCreatedDate = user?.created_at 
    ? format(new Date(user.created_at), 'dd.MM.yyyy')
    : 'Недоступно';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="dashboard-card overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#e4d079]/10 to-transparent"></div>
          
          <CardHeader className="flex flex-row items-center justify-between z-10 relative">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-[#e4d079]/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-[#e4d079]" />
                </span>
                Личные данные
              </CardTitle>
              <CardDescription>
                Управляйте информацией вашего профиля
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full hover:bg-[#e4d079]/10"
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4 text-[#e4d079]" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-yellow-400/70">Имя</Label>
                <div className="relative">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className={`bg-black/40 border-[#e4d079]/10 focus:border-[#e4d079]/30 ${isEditing ? 'pl-10' : ''}`}
                    placeholder="Введите ваше имя"
                  />
                  {isEditing && (
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#e4d079]/50" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-yellow-400/70">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className={`bg-black/40 border-[#e4d079]/10 focus:border-[#e4d079]/30 ${isEditing ? 'pl-10' : ''}`}
                    placeholder="+7 (___) ___-____"
                  />
                  {isEditing && (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#e4d079]/50" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-yellow-400/70">О себе</Label>
              <div className="relative">
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing || isLoading}
                  className="min-h-[100px] bg-black/40 border-[#e4d079]/10 focus:border-[#e4d079]/30"
                  placeholder="Расскажите немного о себе..."
                />
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  className="flex justify-end gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    className="gap-2"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Сохранить
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 mt-4 border-t border-[#e4d079]/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-yellow-400/50">Email</Label>
                  <p className="text-sm font-medium text-[#e4d079] truncate">{user?.email || "Не указан"}</p>
                </div>
                <div>
                  <Label className="text-yellow-400/50">Аккаунт с</Label>
                  <p className="text-sm font-medium text-[#e4d079]">{accountCreatedDate}</p>
                </div>
                <div>
                  <Label className="text-yellow-400/50">Статус</Label>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[#e4d079]" />
                    <p className="text-sm font-medium text-[#e4d079]">{profile?.status || "Стандарт"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-yellow-400/50">Уровень</Label>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-[#e4d079]" />
                    <p className="text-sm font-medium text-[#e4d079]">{profile?.level || 1}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="dashboard-card overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#e4d079]/10 to-transparent"></div>
          
          <CardHeader className="z-10 relative">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-[#e4d079]/10 p-2 rounded-full">
                <Shield className="h-4 w-4 text-[#e4d079]" />
              </span>
              Данные аккаунта
            </CardTitle>
            <CardDescription>
              Информация о вашем аккаунте и подписке
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-yellow-400/50 block mb-1">ID пользователя</Label>
                  <div className="bg-black/30 p-2 rounded border border-[#e4d079]/10 text-sm font-mono">
                    {user?.id || "Недоступно"}
                  </div>
                </div>
                
                <div>
                  <Label className="text-yellow-400/50 block mb-1">Тип аутентификации</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#e4d079]" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-yellow-400/50 block mb-1">Подписка</Label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-2 w-2 rounded-full ${profile?.has_pass ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium">{profile?.has_pass ? 'Активна' : 'Не активна'}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-yellow-400/50 block mb-1">Очки</Label>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#e4d079]" />
                    <span className="text-sm font-medium">{profile?.points || 0} очков</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
