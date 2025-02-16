
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Monitor, Gamepad, Trophy } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Monitor,
      title: "Современное оборудование",
      description: "Мощные компьютеры и периферия для максимального комфорта",
    },
    {
      icon: Gamepad,
      title: "Киберспорт",
      description: "Регулярные турниры и мероприятия для геймеров",
    },
    {
      icon: Trophy,
      title: "Система наград",
      description: "Зарабатывайте очки и получайте эксклюзивные награды",
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background z-10" />
        <div className="absolute inset-0 bg-[url('/photo-1488590528505-98d2b5aba04b')] bg-cover bg-center" />
        <div className="container relative z-20 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-glow"
          >
            COLIZEUM
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-foreground/80"
          >
            Погрузитесь в мир киберспорта и развлечений
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/register">
              <Button className="text-lg neon-glow">
                Начать
                <ChevronRight className="ml-2" size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-glow">
            Наши преимущества
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-panel p-6 rounded-lg text-center"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
