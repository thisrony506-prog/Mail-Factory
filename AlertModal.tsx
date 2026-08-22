import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const timer = setTimeout(() => {
        handleClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
      <div 
        className={`pointer-events-auto relative flex items-center p-2.5 pr-2 gap-3 bg-[#FEF2F2] dark:bg-[#3E141B] border border-[#FEE2E2] dark:border-[#5C1B25] shadow-[0_10px_40px_-10px_rgba(225,29,72,0.25)] rounded-2xl w-auto max-w-[92%] sm:max-w-sm mx-auto transition-all ${
          isClosing ? 'opacity-0 -translate-y-8 scale-90 duration-300' : 'animate-bounce-toast'
        }`}
      >
        {/* Solid Red Error Icon */}
        <div className="flex items-center justify-center bg-rose-500 text-white w-9 h-9 rounded-xl shrink-0 shadow-md shadow-rose-500/20 ml-0.5">
          <AlertCircle className="w-5 h-5" strokeWidth={2.5} />
        </div>
        
        {/* Error Message */}
        <div className="flex-1 py-1 mr-1">
          <p className="text-[13.5px] font-bold text-rose-900 dark:text-rose-100 leading-snug">
            {message}
          </p>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="p-1.5 text-rose-400 hover:bg-rose-200/50 dark:hover:bg-rose-900/50 rounded-full transition-colors shrink-0 active:scale-90"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>

        <style>{`
          .animate-bounce-toast {
            animation: toast-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes toast-spring {
            0% { opacity: 0; transform: translateY(-40px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};
