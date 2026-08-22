import React, { useState } from 'react';
import { DEFAULT_LOGO } from './AppContext';

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

  const [imgError, setImgError] = useState<boolean>(false);
  const logoUrl = src || '/app-logo.png';

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
          className="absolute -inset-1 rounded-full bg-indigo-500/20 opacity-70 blur-md pointer-events-none"
        />
      )}

      {/* Clean Transparent Logo Image - No black background */}
      <img
        src={imgError ? '/app-logo.png' : logoUrl}
        alt="Mail Factory"
        className="w-full h-full object-contain select-none relative z-10 transition-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
        onError={() => setImgError(true)}
      />
    </div>
  );
};
