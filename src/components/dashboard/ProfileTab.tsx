
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, User, Phone } from "lucide-react";
import { motion } from "framer-motion";

export const ProfileTab = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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

      return data;
    }
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          phone_number: phoneNumber
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="dashboard-card overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#e4d079]/10 to-transparent"></div>
        
        <CardHeader className="flex flex-row items-center justify-between z-10 relative">
          <CardTitle className="flex items-center gap-2">
            <span className="bg-[#e4d079]/10 p-2 rounded-full">
              <User className="h-4 w-4 text-[#e4d079]" />
            </span>
            Личные данные
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full hover:bg-[#e4d079]/10"
          >
            <Pencil className="h-4 w-4 text-[#e4d079]" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-yellow-400/70">Имя</Label>
            <div className="relative">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                className={`bg-black/40 border-[#e4d079]/10 focus:border-[#e4d079]/30 ${isEditing ? 'pl-10' : ''}`}
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
                disabled={!isEditing}
                className={`bg-black/40 border-[#e4d079]/10 focus:border-[#e4d079]/30 ${isEditing ? 'pl-10' : ''}`}
              />
              {isEditing && (
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#e4d079]/50" />
              )}
            </div>
          </div>

          {isEditing && (
            <motion.div 
              className="flex justify-end gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Отмена
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Сохранить
              </Button>
            </motion.div>
          )}

          <div className="pt-4 border-t border-[#e4d079]/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-yellow-400/50">Статус</Label>
                <p className="text-lg font-medium text-[#e4d079]">{profile?.status || "Стандарт"}</p>
              </div>
              <div>
                <Label className="text-yellow-400/50">Уровень</Label>
                <p className="text-lg font-medium text-[#e4d079]">{profile?.level || 1}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
