import React, { useState, useMemo } from 'react';
import { APP_LOGO_BASE64 } from './logoBase64';
import { Mail } from 'lucide-react';

interface AppLogo3DProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  glow?: boolean;
  animated?: boolean;
  src?: string;
}

export function AppLogo3D({
  className = '',
  size = 'md',
  glow = false,
  animated = false,
  src,
}: AppLogo3DProps) {
  let dimension = 40;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs': dimension = 24; break;
      case 'sm': dimension = 32; break;
      case 'md': dimension = 40; break;
      case 'lg': dimension = 52; break;
      case 'xl': dimension = 72; break;
    }
  }

  const [hasError, setHasError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);
  
  const sources = useMemo(() => [
    src,
    '/app-logo.webp',
    'https://files.catbox.moe/xdvz6g.png',
    '/app-logo.png',
    APP_LOGO_BASE64,
    '/icon-192.png'
  ].filter(Boolean) as string[], [src]);

  const currentSrc = sources[srcIndex] || APP_LOGO_BASE64;

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 bg-transparent ${
        animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {glow && (
        <div className="absolute -inset-1 rounded-full bg-indigo-500/20 opacity-70 blur-md pointer-events-none" />
      )}
      {!hasError ? (
        <img
          src={currentSrc}
          alt="Mail Factory Logo"
          width={dimension}
          height={dimension}
          loading="eager"
          decoding="async"
          crossOrigin="anonymous"
          className="w-full h-full object-contain select-none bg-transparent"
          onError={handleError}
        />
      ) : (
        <div 
          className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-md relative overflow-hidden"
          style={{ width: dimension, height: dimension }}
        >
          <Mail className="w-1/2 h-1/2 text-white relative z-10" />
        </div>
      )}
    </div>
  );
}
