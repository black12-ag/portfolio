import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypewriterProps } from '../animations.types';

const TypewriterEffect: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  className = '',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }
  }, [text, speed, delay]);

  const startTyping = () => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [0, 1] }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse' 
          }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </span>
  );
};

export default TypewriterEffect;
