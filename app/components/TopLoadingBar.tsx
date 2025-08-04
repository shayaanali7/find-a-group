'use client'
import React, { useEffect, useState } from 'react';
import { useLoading } from './LoadingContext';

const TopLoadingBar: React.FC = () => {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress(0);
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 200);
    } else {
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out shadow-lg"
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px rgba(147, 51, 234, 0.5)' : 'none'
        }}
      />
    </div>
  );
};

export default TopLoadingBar;