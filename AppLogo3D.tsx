import React, { useState } from 'react';
import { DEFAULT_LOGO } from './AppContext';
import bundledLogo from './src/assets/app-logo.png';

interface AppLogo3DProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  glow?: boolean;
  animated?: boolean;
  src?: string;
}

export const AppLogo3D: React.FC<AppLogo3DProps> = ({
  className = '',
  size = 'md',
  glow = false,
  animated = false,
  src,
}) => {
  let dimension = 40;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs':
        dimension = 24;
        break;
      case 'sm':
        dimension = 32;
        break;
      case 'md':
        dimension = 40;
        break;
      case 'lg':
        dimension = 52;
        break;
      case 'xl':
        dimension = 72;
        break;
    }
  }

  const [currentSrcIndex, setCurrentSrcIndex] = useState<number>(0);
  
  // Try bundled logo first, then props/default, then static paths
  const sources = [
    src,
    bundledLogo,
    DEFAULT_LOGO,
    '/app-logo.png',
    '/new-logo.png',
  ].filter(Boolean) as string[];

  const currentSrc = sources[currentSrcIndex] || bundledLogo || '/app-logo.png';

  const handleImgError = () => {
    if (currentSrcIndex < sources.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 bg-transparent ${
        animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {/* Subtle Glow only if explicitly requested */}
      {glow && (
        <div
          className="absolute -inset-1 rounded-full bg-indigo-500/30 opacity-70 blur-md pointer-events-none"
        />
      )}

      <img
        src={currentSrc}
        alt="Mail Factory Logo"
        width={dimension}
        height={dimension}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain select-none relative z-10 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        onError={handleImgError}
      />
    </div>
  );
};


