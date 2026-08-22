const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldGridEnd = `                    </div>
                  </div>
                </div>
              );`;

const newGridEnd = `                    </div>
                  </div>
                  {row.error && (
                    <div className="mt-2 flex items-start gap-1.5 text-rose-500 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[13px] font-medium leading-snug">{row.error}</p>
                    </div>
                  )}
                </div>
              );`;

code = code.replace(oldGridEnd, newGridEnd);

const errorBannerOld = `{/* Error Banner */}`;
const errorBannerNew = `{globalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-600">{globalError}</p>
              </div>
            )}`;

code = code.replace(errorBannerOld, errorBannerNew);

fs.writeFileSync('ExchangeView.tsx', code);
