import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../../../constants/animations';

interface StaticElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  className?: string;
}

const StaticElement: React.FC<StaticElementProps> = ({
  children,
  delay = 0,
  duration = ANIMATION_DURATIONS.normal,
  direction = 'up',
  className = '',
}) => {
  const getInitialState = () => {
    switch (direction) {
      case 'up': return { y: 30, opacity: 0 };
      case 'down': return { y: -30, opacity: 0 };
      case 'left': return { x: 30, opacity: 0 };
      case 'right': return { x: -30, opacity: 0 };
      case 'scale': return { scale: 0.8, opacity: 0 };
      default: return { opacity: 0 };
    }
  };

  const getFinalState = () => {
    return { x: 0, y: 0, scale: 1, opacity: 1 };
  };

  return (
    <motion.div
      className={className}
      initial={getInitialState()}
      animate={getFinalState()}
      transition={{
        duration,
        delay,
        ease: ANIMATION_EASINGS.professional,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default StaticElement;
