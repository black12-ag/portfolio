import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Helper Components ---

/**
 * Renders the central logo using an image.
 * Now larger and with a hover effect applied in the main component.
 */
interface CentralLogoProps {
  imageUrl?: string;
  alt?: string;
}

const CentralLogo: React.FC<CentralLogoProps> = ({ 
  imageUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
  alt = "Munir Ayub"
}) => (
  <img
    src={imageUrl}
    alt={alt}
    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-600"
    onError={(e) => { 
      const target = e.target as HTMLImageElement;
      target.onerror = null; 
      target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face';
    }}
  />
);

/**
 * Main Text Arc Effect Component
 *
 * This component displays text along a circular path with a central logo.
 * It's responsive and automatically adapts to the system's light or dark theme.
 *
 * @param {string} text - The text to display in an arc.
 * @param {number} diameter - The diameter of the text circle.
 */
interface TextArcProps {
  text: string;
  diameter?: number;
}

const TextArc: React.FC<TextArcProps> = ({ text, diameter = 200 }) => {
    const characters = text.split('');
    const radius = diameter / 2;
    const angleStep = 360 / characters.length;

    return (
        <div className="relative" style={{ width: diameter, height: diameter }}>
            {characters.map((char, index) => {
                const angle = angleStep * index;
                const charStyle = {
                    position: 'absolute' as const,
                    height: `${radius}px`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'bottom center',
                    top: 0,
                    left: '50%',
                    marginLeft: '-0.5em', // Center the character
                };

                return (
                    <div key={index} style={charStyle}>
                        {/* Font is now bigger and bolder */}
                        <span className="text-base md:text-lg font-bold font-pixelated text-slate-800 dark:text-slate-200">
                            {char}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

interface TextArcEffectProps {
  text?: string;
  logoUrl?: string;
  logoAlt?: string;
  className?: string;
}

export function TextArcEffect({ 
  text = " THANK YOU • FOR VISITING • MUNIR AYUB •",
  logoUrl,
  logoAlt = "Munir Ayub",
  className = ""
}: TextArcEffectProps) {
    // Diameter is adjusted to be smaller
    const [diameter, setDiameter] = useState(260);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setDiameter(220); // Smaller diameter for mobile
            } else {
                setDiameter(260); // Smaller diameter for desktop
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    

    return (
        <div className={`flex items-center justify-center w-full py-20 bg-slate-100 dark:bg-neutral-900 transition-colors duration-500 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Animated Rotating Arc Text */}
                {/* Added 'pointer-events-none' to allow hover events to pass through to the logo */}
                <motion.div
                    className="absolute pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: 'linear',
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <TextArc text={text} diameter={diameter} />
                </motion.div>

                {/* Central Logo with hover animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    viewport={{ once: true }}
                >
                    <CentralLogo imageUrl={logoUrl} alt={logoAlt} />
                </motion.div>
                
                 {/* Grainy Background Effect */}
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] animate-grain"></div>
                </div>
            </div>

            {/* Adding custom styles for font and grain effect */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
                
                .font-pixelated {
                    font-family: 'VT323', monospace;
                }

                @keyframes grain {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-5%, -10%); }
                    20% { transform: translate(-15%, 5%); }
                    30% { transform: translate(7%, -25%); }
                    40% { transform: translate(-5%, 25%); }
                    50% { transform: translate(-15%, 10%); }
                    60% { transform: translate(15%, 0%); }
                    70% { transform: translate(0%, 15%); }
                    80% { transform: translate(3%, 35%); }
                    90% { transform: translate(-10%, 10%); }
                }

                .animate-grain::before {
                    content: "";
                    position: absolute;
                    top: -100%;
                    left: -100%;
                    width: 900%;
                    height: 900%;
                    background-image: url('https://upload.wikimedia.org/wikipedia/commons/5/5c/Noise.png');
                    opacity: 0.05;
                    animation: grain 8s steps(10) infinite;
                }
                
                .dark .animate-grain::before {
                    opacity: 0.1;
                }
            `}</style>
        </div>
    );
}
