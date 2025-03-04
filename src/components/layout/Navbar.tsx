
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, Shield, Home, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#e4d079]/10">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-[#e4d079]">COLIZEUM</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-[#e4d079]/80 hover:text-[#e4d079]"
            >
              <Home className="w-4 h-4" />
              <span>Главная</span>
            </Link>
            <Link
              to="/support"
              className="flex items-center space-x-2 text-[#e4d079]/80 hover:text-[#e4d079]"
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span>Поддержка</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-[#e4d079]/80 hover:text-[#e4d079] hover:bg-[#e4d079]/5"
                  onClick={() => navigate('/dashboard')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Личный кабинет
                </Button>
                <Button
                  variant="ghost"
                  className="text-[#e4d079]/80 hover:text-[#e4d079] hover:bg-[#e4d079]/5"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-[#e4d079]/80 hover:text-[#e4d079] hover:bg-[#e4d079]/5">
                    Войти
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="default" 
                    className="bg-[#e4d079] text-black hover:bg-[#e4d079]/90"
                  >
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#e4d079]"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-t border-[#e4d079]/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="flex items-center space-x-2 px-3 py-2 text-[#e4d079]/80 hover:text-[#e4d079]"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Главная</span>
            </Link>
            <Link
              to="/support"
              className="flex items-center space-x-2 px-3 py-2 text-[#e4d079]/80 hover:text-[#e4d079]"
              onClick={() => setIsOpen(false)}
            >
              <HeadphonesIcon className="w-4 h-4" />
              <span>Поддержка</span>
            </Link>
            <div className="border-t border-[#e4d079]/10 mt-2 pt-2 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2 text-[#e4d079]/80 hover:text-[#e4d079]"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-[#e4d079]/80 hover:text-[#e4d079]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-[#e4d079]/80 hover:text-[#e4d079]"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 bg-[#e4d079]/10 text-[#e4d079] rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
