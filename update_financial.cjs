const fs = require('fs');
let code = fs.readFileSync('ProfileView.tsx', 'utf-8');

const originalBanner = `{/* Financial Summary Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] text-slate-300 font-bold block">
                গত {chartRange} দিনে মোট উপার্জিত
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ৳{rangeTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 font-bold block">
              {t.peakSingleEarn}
            </span>
            <span className="text-xs font-black text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 inline-block">
              ৳{rangePeak.toFixed(2)}
            </span>
          </div>
        </div>`;

const updatedBanner = `{/* Lifetime Earnings & Payout Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
            <span className="text-[11px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {language === 'bn' ? 'মোট উপার্জন (লাইফটাইম)' : 'Total Earnings (Lifetime)'}
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono block">
              ৳{(Number(profile?.totalEarnings) || 0).toFixed(2)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-sky-500/10 rounded-full blur-xl" />
            <span className="text-[11px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
              {language === 'bn' ? 'মোট পে-আউট (উত্তোলন)' : 'Total Payout (Withdrawn)'}
            </span>
            <span className="text-xl font-black text-sky-400 font-mono block">
              ৳{(Number(profile?.total_withdrawn) || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Financial Summary Highlight Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md mt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[11px] text-slate-300 font-bold block">
                গত {chartRange} দিনে মোট উপার্জিত
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                ৳{rangeTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-300 font-bold block">
              {t.peakSingleEarn}
            </span>
            <span className="text-xs font-black text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 inline-block">
              ৳{rangePeak.toFixed(2)}
            </span>
          </div>
        </div>`;

code = code.replace(originalBanner, updatedBanner);
fs.writeFileSync('ProfileView.tsx', code);
