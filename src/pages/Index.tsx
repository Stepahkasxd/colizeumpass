
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import HeroSection from "@/components/home/HeroSection";
import CurrentPassCard from "@/components/home/CurrentPassCard";
import FeatureCards from "@/components/home/FeatureCards";
import NewsSection from "@/components/home/NewsSection";
import FaqSection from "@/components/home/FaqSection";

type Pass = Database["public"]["Tables"]["passes"]["Row"];

const Index = () => {
  const { data: passes, isLoading } = useQuery({
    queryKey: ['passes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .limit(1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pass[];
    },
    // Enable the query regardless of user authentication status
    enabled: true
  });

  return (
    <div className="min-h-screen pt-20 pb-12 animated-gradient overflow-hidden">
      {/* Декоративные элементы */}
      <div className="fixed top-0 left-0 w-full h-screen bg-dots opacity-5 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <HeroSection />

          {!isLoading && passes && passes.length > 0 && (
            <CurrentPassCard passes={passes} />
          )}

          <FeatureCards />
          
          <NewsSection />
          
          <FaqSection />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
