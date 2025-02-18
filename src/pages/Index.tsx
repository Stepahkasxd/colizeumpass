
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow">
            Добро пожаловать в Colizeum
          </h1>
          <p className="text-xl text-foreground/70 mb-12">
            Ваш портал в мир киберспорта и развлечений
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Турниры</h2>
              <p className="text-foreground/70">
                Участвуйте в захватывающих турнирах и соревнуйтесь с лучшими игроками
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Сообщество</h2>
              <p className="text-foreground/70">
                Присоединяйтесь к активному сообществу единомышленников
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-panel p-6 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Награды</h2>
              <p className="text-foreground/70">
                Зарабатывайте очки и получайте эксклюзивные награды
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
