import React, { useState } from 'react';

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
          className="absolute -inset-1 rounded-full bg-indigo-500/25 opacity-70 blur-md pointer-events-none"
        />
      )}

      {/* Clean Transparent Logo Image / SVG */}
      {!imgError ? (
        <img
          src={logoUrl}
          alt="Mail Factory Logo"
          width={dimension}
          height={dimension}
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain select-none relative z-10 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Standalone High Precision SVG Vector Logo Fallback */
        <svg
          viewBox="0 0 512 512"
          width={dimension}
          height={dimension}
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fallbackBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
            <linearGradient id="fallbackFlapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="fallbackGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <rect x="48" y="100" width="416" height="312" rx="44" fill="url(#fallbackBodyGrad)" />
          <rect x="50" y="102" width="412" height="308" rx="42" fill="none" stroke="#A5B4FC" strokeWidth="4" strokeOpacity="0.6" />
          <rect x="100" y="70" width="312" height="150" rx="20" fill="#FFFFFF" opacity="0.95" />
          <line x1="140" y1="105" x2="260" y2="105" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
          <line x1="140" y1="125" x2="330" y2="125" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
          <path d="M48 116 L256 280 L464 116" fill="url(#fallbackFlapGrad)" />
          <path d="M48 116 L256 280 L464 116" fill="none" stroke="#C7D2FE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          <circle cx="256" cy="275" r="54" fill="url(#fallbackGoldGrad)" />
          <circle cx="256" cy="275" r="48" fill="none" stroke="#FEF08A" strokeWidth="4" />
          <path d="M262 238 L238 274 L256 274 L250 312 L276 270 L258 270 Z" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
};

