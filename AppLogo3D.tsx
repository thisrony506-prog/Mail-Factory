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
  glow = true,
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
  const logoUrl = src || DEFAULT_LOGO;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${
        animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {/* Subtle Ambient Glow */}
      {glow && (
        <div
          className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500/40 to-blue-500/30 opacity-70 blur-[4px] pointer-events-none"
          style={{ borderRadius: dimension * 0.32 }}
        />
      )}

      {/* Modern Sleek Container */}
      <div
        className="w-full h-full rounded-xl bg-slate-800/90 border border-indigo-500/30 shadow-md relative z-10 flex items-center justify-center overflow-hidden backdrop-blur-sm"
        style={{ borderRadius: dimension * 0.26 }}
      >
        <img
          src={imgError ? '/app-logo.png' : logoUrl}
          alt="Mail Factory"
          className="w-full h-full object-cover object-center rounded-[inherit] transition-transform"
          onError={() => setImgError(true)}
        />
      </div>
    </div>
  );
};
