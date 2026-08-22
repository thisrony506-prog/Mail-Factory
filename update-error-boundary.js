const fs = require('fs');
const content = fs.readFileSync('ErrorBoundary.tsx', 'utf8');

const newRender = `  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-[260px] text-center shadow-2xl">
            <h1 className="text-[13px] font-bold text-white mb-1.5">Network Error</h1>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">A connection problem occurred.<br/>Please refresh the page.</p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }`;

const updated = content.replace(/render\(\) \{[\s\S]*\}\s*\}$/, newRender + '\n}\n');
fs.writeFileSync('ErrorBoundary.tsx', updated);
