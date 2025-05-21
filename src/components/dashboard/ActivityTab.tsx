
import { motion } from "framer-motion";
import { ActivityList } from "./activity/ActivityList";
import { UpcomingEvents } from "./activity/UpcomingEvents";

export const ActivityTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <ActivityList />
      <UpcomingEvents />
    </motion.div>
  );
};
