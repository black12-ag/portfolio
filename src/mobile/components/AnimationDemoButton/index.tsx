import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedPortfolioDemo from '../EnhancedPortfolioDemo';

const AnimationDemoButton: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      {/* Demo Toggle Button */}
      <motion.button
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDemo(!showDemo)}
      >
        {showDemo ? '← Back to Original' : '🎨 View Animated Demo'}
      </motion.button>

      {/* Demo Overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black"
          >
            <EnhancedPortfolioDemo />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimationDemoButton;
