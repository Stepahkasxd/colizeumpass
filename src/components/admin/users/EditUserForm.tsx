
import { useState } from "react";
import { UserProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, RotateCw } from "lucide-react";

interface EditUserFormProps {
  user: UserProfile;
  onSuccess?: () => void;
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          phone_number: phoneNumber,
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("Информация пользователя обновлена");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Не удалось обновить информацию пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Имя пользователя</Label>
        <Input
          id="displayName"
          placeholder="Введите имя пользователя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-black/30 border-[#e4d079]/20"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Номер телефона</Label>
        <Input
          id="phoneNumber"
          placeholder="+7 (___) ___-__-__"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-black/30 border-[#e4d079]/20"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Сохранение...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </>
        )}
      </Button>
    </form>
  );
}
