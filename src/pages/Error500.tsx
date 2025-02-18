
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Error500 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-black/50 to-black">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center glass-panel p-8 rounded-lg"
        >
          <h1 className="text-8xl font-bold mb-4 text-yellow-400/80">500</h1>
          <p className="text-2xl text-yellow-400/60 mb-8">Внутренняя ошибка сервера</p>
          <div className="mb-8 text-yellow-400/40">
            Что-то пошло не так. Мы уже работаем над исправлением.
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

export default Error500;
