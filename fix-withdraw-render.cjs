const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

// Account Input Error
const accountInputHtml = `<input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  placeholder={isUSDT ? 'Enter BEP20 Address (0x...)' : t.accountNumber}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-800 bg-slate-50 hover:bg-white focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />`;

const accountInputHtmlNew = `<input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  placeholder={isUSDT ? 'Enter BEP20 Address (0x...)' : t.accountNumber}
                  className={\`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 text-sm font-bold text-slate-800 bg-slate-50 hover:bg-white focus:outline-none focus:bg-white transition-colors \${fieldErrors.account ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-600'}\`}
                />`;
code = code.replace(accountInputHtml, accountInputHtmlNew);

// Insert error underneath account input container (it has an end tag </div> followed by {isUSDT && ...)
const accountContainerEnd = `</button>
              </div>
              {isUSDT && (`;
const accountContainerEndNew = `</button>
              </div>
              {fieldErrors.account && (
                <div className="mt-1.5 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[2px]" />
                  <p className="text-xs font-bold leading-snug">{fieldErrors.account}</p>
                </div>
              )}
              {isUSDT && (`;
code = code.replace(accountContainerEnd, accountContainerEndNew);

// Amount Input Error
const amountInputHtml = `<input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFieldErrors({});
                }}
                min={currentMinWithdraw}
                max={availableBalance}
                placeholder={\`Min ৳\${currentMinWithdraw}\${isUSDT ? ' (~$2)' : ''}\`}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50 hover:bg-white transition-colors"
              />`;

const amountInputHtmlNew = `<input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
                }}
                min={currentMinWithdraw}
                max={availableBalance}
                placeholder={\`Min ৳\${currentMinWithdraw}\${isUSDT ? ' (~$2)' : ''}\`}
                className={\`w-full rounded-xl border-2 px-4 py-3.5 text-base font-bold text-slate-900 focus:outline-none bg-slate-50 hover:bg-white transition-colors \${fieldErrors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-600'}\`}
              />
              {fieldErrors.amount && (
                <div className="mt-1 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[2px]" />
                  <p className="text-xs font-bold leading-snug">{fieldErrors.amount}</p>
                </div>
              )}`;
code = code.replace(amountInputHtml, amountInputHtmlNew);

// Global Error
const globalErrorHtml = `{/* Error Message */}`;
const globalErrorHtmlNew = `{fieldErrors.global && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 mb-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-600 leading-snug">{fieldErrors.global}</p>
              </div>
            )}`;
code = code.replace(globalErrorHtml, globalErrorHtmlNew);

fs.writeFileSync('WithdrawView.tsx', code);
