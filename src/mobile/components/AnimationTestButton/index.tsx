import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AnimationTestButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
    >
      <motion.button
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm hover:shadow-3xl transition-all"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/animation-demo')}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        🎨 Test Animations
      </motion.button>
    </motion.div>
  );
};

export default AnimationTestButton;
