import React, { useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scale' | 'slide';
}

export default function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  animation = 'fadeInUp' 
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Set initial state
    card.style.opacity = '0';
    card.style.transform = getInitialTransform(animation);
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    // Trigger animation after delay
    const timer = setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) translateX(0) scale(1)';
    }, delay);

    return () => clearTimeout(timer);
  }, [animation, delay]);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </Card>
  );
}

function getInitialTransform(animation: string): string {
  switch (animation) {
    case 'fadeInUp':
      return 'translateY(20px)';
    case 'fadeInLeft':
      return 'translateX(-20px)';
    case 'fadeInRight':
      return 'translateX(20px)';
    case 'scale':
      return 'scale(0.95)';
    case 'slide':
      return 'translateY(10px)';
    default:
      return 'translateY(20px)';
  }
}
