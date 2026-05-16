import React from "react";
import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        y:       { type: "spring", stiffness: 260, damping: 22 },
        opacity: { duration: 0.3, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
