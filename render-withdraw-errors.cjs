const fs = require('fs');
let code = fs.readFileSync('WithdrawView.tsx', 'utf-8');

// For account number field
const accountEndOld = `              <input
                type="text"
                value={accountNumber}
                onChange={(e) => handleAccountChange(e.target.value)}
                placeholder={isUSDT ? '0x...' : '01XXXXXXXXX'}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>`;

const accountEndNew = `              <input
                type="text"
                value={accountNumber}
                onChange={(e) => handleAccountChange(e.target.value)}
                placeholder={isUSDT ? '0x...' : '01XXXXXXXXX'}
                className={\`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 font-medium text-slate-800 placeholder:text-slate-400 transition-all \${fieldErrors.account ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-rose-500/20 focus:border-rose-500'}\`}
              />
            </div>
            {fieldErrors.account && (
              <div className="mt-2 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-snug">{fieldErrors.account}</p>
              </div>
            )}
          </div>`;
code = code.replace(accountEndOld, accountEndNew);

// For amount field
const amountEndOld = `              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="0.00"
                className="w-full pl-12 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-bold text-slate-800 text-lg placeholder:text-slate-300 placeholder:font-medium transition-all"
              />`;

const amountEndNew = `              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFieldErrors(prev => ({ ...prev, amount: undefined, global: undefined }));
                }}
                placeholder="0.00"
                className={\`w-full pl-12 pr-16 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 font-bold text-slate-800 text-lg placeholder:text-slate-300 placeholder:font-medium transition-all \${fieldErrors.amount ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-rose-500/20 focus:border-rose-500'}\`}
              />`;
code = code.replace(amountEndOld, amountEndNew);

const amountErrorAddOld = `              <button
                type="button"
                onClick={handleMaxAmount}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-md hover:bg-rose-200 active:scale-95 transition-all"
              >
                MAX
              </button>
            </div>
            {/* Amount Helpers */}`;

const amountErrorAddNew = `              <button
                type="button"
                onClick={handleMaxAmount}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-md hover:bg-rose-200 active:scale-95 transition-all"
              >
                MAX
              </button>
            </div>
            {fieldErrors.amount && (
              <div className="mt-2 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1 px-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-snug">{fieldErrors.amount}</p>
              </div>
            )}
            {/* Amount Helpers */}`;

code = code.replace(amountErrorAddOld, amountErrorAddNew);


// Global Error
const submitBtnOld = `          <button
            type="submit"
            disabled={isSubmitting || maintenanceMode || isWithdrawDisabled}
            className={\`w-full py-4 rounded-xl font-bold text-[16px] text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] \${
              maintenanceMode || isWithdrawDisabled
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : isSubmitting
                ? 'bg-rose-500/70 cursor-wait shadow-none'
                : 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20'
            }\`}
          >
            {isSubmitting ? (`;

const submitBtnNew = `          {fieldErrors.global && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-600">{fieldErrors.global}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || maintenanceMode || isWithdrawDisabled}
            className={\`w-full py-4 rounded-xl font-bold text-[16px] text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] \${
              maintenanceMode || isWithdrawDisabled
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : isSubmitting
                ? 'bg-rose-500/70 cursor-wait shadow-none'
                : 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20'
            }\`}
          >
            {isSubmitting ? (`;

code = code.replace(submitBtnOld, submitBtnNew);


fs.writeFileSync('WithdrawView.tsx', code);
