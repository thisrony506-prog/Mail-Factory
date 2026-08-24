import React, { ReactNode, ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[App Crash Caught by ErrorBoundary]:', error, errorInfo);
    // Auto-recover once if it's a transient rendering hiccup
    const retryCount = Number(sessionStorage.getItem('mf_error_retries') || '0');
    if (retryCount < 2) {
      sessionStorage.setItem('mf_error_retries', String(retryCount + 1));
      setTimeout(() => {
        (this as any).setState({ hasError: false });
      }, 800);
    }
  }

  handleReload = async () => {
    try {
      sessionStorage.removeItem('mf_error_retries');
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
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-[300px] text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white mb-1">Connecting to Server...</h1>
              <p className="text-[11px] text-slate-400 leading-relaxed">Optimizing connection for your browser session. Please wait or click refresh.</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => (this as any).setState({ hasError: false })}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <span>Try Again Now</span>
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}
