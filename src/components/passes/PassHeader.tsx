
import { motion } from "framer-motion";
import { Pass } from "@/types/user";

interface PassHeaderProps {
  pass: Pass;
}

export const PassHeader = ({ pass }: PassHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <motion.h1 
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {pass.name}
        </motion.h1>
        <motion.p 
          className="text-foreground/70 text-lg mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {pass.description}
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-xl font-bold px-4 py-2 rounded-full bg-primary/10 text-primary flex items-center justify-center"
      >
        {pass.price.toLocaleString('ru-RU')} ₽
      </motion.div>
    </div>
  );
};
