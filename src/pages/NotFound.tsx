
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-black">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center glass-panel p-8 rounded-lg"
        >
          <h1 className="text-8xl font-bold mb-4 text-yellow-400/80">404</h1>
          <p className="text-2xl text-yellow-400/60 mb-8">Страница не найдена</p>
          <div className="mb-8 text-yellow-400/40">
            Путь: {location.pathname}
          </div>
          <div className="mb-8 text-yellow-400/40">
            Похоже, вы забрели не туда. Давайте вернемся на главную страницу.
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-medium text-black bg-yellow-400 rounded-lg transition-all hover:bg-yellow-300 hover:scale-105"
          >
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
