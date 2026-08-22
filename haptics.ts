export const hapticFeedback = {
  light: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore devices not supporting vibration
      }
    }
  },
  medium: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch {
        // Ignore
      }
    }
  },
  heavy: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch {
        // Ignore
      }
    }
  },
  success: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([20, 50, 20]);
      } catch {
        // Ignore
      }
    }
  },
  error: () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([50, 50, 50]);
      } catch {
        // Ignore
      }
    }
  }
};
