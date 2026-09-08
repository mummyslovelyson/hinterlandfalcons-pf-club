import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: 0,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
