
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

  // Обработка прокрутки для эффекта фона
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

  const navItems = [
    { title: "Главная", path: "/", icon: <Home className="w-4 h-4" /> },
    { title: "Поддержка", path: "/support", icon: <HeadphonesIcon className="w-4 h-4" /> },
  ];

  // Определяем, активна ли ссылка
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? "glass-panel shadow-lg" 
          : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-with-shadow group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e4d079] to-[#f0e3a1] group-hover:from-[#f0e3a1] group-hover:to-[#e4d079] transition-all duration-300">
                COLIZEUM
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 transition-colors duration-200 px-3 py-2 rounded-md ${
                    isActive(item.path) 
                      ? "text-[#e4d079] bg-[#e4d079]/10" 
                      : "text-foreground/80 hover:text-primary hover:bg-[#e4d079]/5"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className={`hover:text-primary hover:bg-[#e4d079]/5 transition-all duration-200 rounded-md ${
                      location.pathname.includes('/dashboard') ? 'bg-[#e4d079]/10 text-[#e4d079]' : ''
                    }`}
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </Button>
                  <Button
                    variant="ghost"
                    className="hover:text-primary hover:bg-[#e4d079]/5 transition-all duration-200"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="hover:text-primary hover:bg-[#e4d079]/5 transition-all duration-200">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="default" 
                        className="neon-glow bg-gradient-to-r from-[#e4d079] to-[#f0e3a1] text-black font-medium"
                      >
                        Регистрация
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-[#e4d079]/5"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden glass-panel animate-fade-in"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                  isActive(item.path) 
                    ? "text-[#e4d079] bg-[#e4d079]/10" 
                    : "text-foreground/80 hover:text-primary hover:bg-[#e4d079]/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-3 py-2 rounded-md ${
                      location.pathname.includes('/dashboard') 
                        ? 'bg-[#e4d079]/10 text-[#e4d079]' 
                        : 'text-foreground/80 hover:text-primary hover:bg-[#e4d079]/5'
                    }`}
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
                    className="flex w-full items-center px-3 py-2 text-foreground/80 hover:text-primary hover:bg-[#e4d079]/5 rounded-md"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-foreground/80 hover:text-primary hover:bg-[#e4d079]/5 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-[#e4d079]/10 to-[#f0e3a1]/10 text-[#e4d079] rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
