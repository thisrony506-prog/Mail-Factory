import { Component, ReactNode, ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // @ts-ignore
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[App Crash Caught by ErrorBoundary]:', error, errorInfo);
  }

  handleReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      localStorage.removeItem('mf_last_user_profile');
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>

          <h1 className="text-xl font-black text-white mb-2">
            পেজ লোড করতে সাময়িক সমস্যা হয়েছে
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন অথবা ক্যাশ ক্লিয়ার করে পুনরায় চেষ্টা করুন।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload App</span>
            </button>

            <button
              onClick={this.handleGoHome}
              className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>হোম পেজে যান</span>
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
