
import { motion } from "framer-motion";
import { Clock, Wallet, Users } from "lucide-react";

const FeatureCards = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-panel p-6 rounded-lg text-left card-hover"
      >
        <div className="mb-4 relative">
          <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
          <Clock className="w-10 h-10 text-primary mb-2 relative" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Быстрая покупка</h2>
        <p className="text-foreground/70">
          Мгновенное оформление пропуска через администратора клуба
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="glass-panel p-6 rounded-lg text-left card-hover"
      >
        <div className="mb-4 relative">
          <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
          <Wallet className="w-10 h-10 text-primary mb-2 relative" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Система лояльности</h2>
        <p className="text-foreground/70">
          Накапливайте баллы за покупки и получайте бонусы
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="glass-panel p-6 rounded-lg text-left card-hover"
      >
        <div className="mb-4 relative">
          <div className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-primary/10"></div>
          <Users className="w-10 h-10 text-primary mb-2 relative" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Поддержка 24/7</h2>
        <p className="text-foreground/70">
          Оперативная помощь от нашей службы поддержки в любое время
        </p>
      </motion.div>
    </div>
  );
};

export default FeatureCards;
