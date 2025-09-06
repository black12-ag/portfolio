import React from 'react';
import { motion } from 'framer-motion';
import { FloatingElementProps } from '../animations.types';
import { ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../../../constants/animations';

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  duration = ANIMATION_DURATIONS.extraSlow,
  amplitude = 20,
  className = '',
}) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration: duration,
        delay,
        repeat: Infinity,
        ease: ANIMATION_EASINGS.smooth,
        repeatType: 'mirror',
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
