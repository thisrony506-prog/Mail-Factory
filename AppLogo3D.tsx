import React, { useState } from 'react';
import { DEFAULT_LOGO } from './AppContext';
import { Mail, Sparkles } from 'lucide-react';

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
  const logoUrl = src || DEFAULT_LOGO || '/app-logo.png';

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

      {imgError ? (
        <div 
          className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-center shadow-md border border-white/20 relative overflow-hidden"
          style={{ width: dimension, height: dimension }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.3),transparent_50%)]" />
          <Mail className="w-1/2 h-1/2 text-white relative z-10 drop-shadow" />
          <div className="absolute bottom-0.5 right-0.5 bg-amber-400 text-amber-950 rounded-full p-0.5 shadow">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        </div>
      ) : (
        <img
          src={logoUrl}
          alt="Mail Factory Logo"
          width={dimension}
          height={dimension}
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain select-none relative z-10 transition-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
};

