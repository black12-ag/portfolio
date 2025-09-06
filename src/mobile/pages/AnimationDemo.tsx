import React from 'react';
import EnhancedPortfolioDemo from '../components/EnhancedPortfolioDemo';

const AnimationDemo: React.FC = () => {
  return (
    <div className="w-full">
      <EnhancedPortfolioDemo />
      
      {/* Quick Navigation Back */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all"
        >
          ← Back to Portfolio
        </button>
      </div>
    </div>
  );
};

export default AnimationDemo;
