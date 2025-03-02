
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, User, Phone, Mail, Calendar, RefreshCw } from "lucide-react";
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
        <Card className="overflow-hidden relative bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-lg transition-all duration-300 hover:shadow-[0_8px_20px_rgba(155,135,245,0.07)]">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-500/10 to-transparent"></div>
          
          <CardHeader className="flex flex-row items-center justify-between z-10 relative">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-purple-500/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-purple-400" />
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
              className="rounded-full hover:bg-purple-500/10"
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4 text-purple-400" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-purple-300/70">Имя</Label>
                <div className="relative">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className={`bg-black/40 border-purple-500/20 focus:border-purple-500/40 ${isEditing ? 'pl-10' : ''}`}
                    placeholder="Введите ваше имя"
                  />
                  {isEditing && (
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-purple-300/70">Номер телефона</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditing || isLoading}
                    className={`bg-black/40 border-purple-500/20 focus:border-purple-500/40 ${isEditing ? 'pl-10' : ''}`}
                    placeholder="+7 (___) ___-____"
                  />
                  {isEditing && (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400/50" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-purple-300/70">О себе</Label>
              <div className="relative">
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing || isLoading}
                  className="min-h-[100px] bg-black/40 border-purple-500/20 focus:border-purple-500/40"
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

            <div className="pt-6 mt-4 border-t border-purple-500/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-300/50">Email</Label>
                  <p className="text-sm font-medium text-purple-300 truncate">{user?.email || "Не указан"}</p>
                </div>
                <div>
                  <Label className="text-purple-300/50">Аккаунт с</Label>
                  <p className="text-sm font-medium text-purple-300">{accountCreatedDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
