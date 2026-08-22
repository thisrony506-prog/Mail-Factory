const fs = require('fs');
let code = fs.readFileSync('HistoryView.tsx', 'utf-8');

const regex = /withdrawRequests\.map\(\(wd, index\) => \{[\s\S]*?return \([\s\S]*?<div className="shrink-0">\{getStatusBadge\(wd\.status\)\}<\/div>\s*<\/div>\s*\);\s*\}\)/;

const newCode = `withdrawRequests.map((wd, index) => {
              const dateObj = new Date(wd.requestedAt);
              const wdDate = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const wdTime = dateObj.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              const wdDay = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                weekday: 'long',
              });

              return (
                <div
                  key={wd.key || index}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      ৳
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black text-slate-800 truncate">
                        ৳{wd.amount}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          via {wd.paymentMethod || wd.method}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 block mt-0.5 truncate">
                        {wdTime} • {wdDate} • {wdDay}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5 truncate">
                        Acc: {wd.paymentNumber}
                      </span>
                      {wd.feeAmount ? (
                        <div className="text-[10px] font-bold mt-1 text-slate-500 flex gap-2 truncate">
                          <span className="text-rose-500 shrink-0">Fee: ৳{wd.feeAmount.toFixed(2)}</span>
                          <span className="text-emerald-600 truncate">Net: ৳{(wd.netAmount || wd.amount).toFixed(2)}</span>
                        </div>
                      ) : null}
                      {wd.trxId && (
                        <div className="text-[11px] font-bold mt-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md inline-block border border-indigo-100">
                          TrxID: <span className="font-mono">{wd.trxId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(wd.status)}</div>
                </div>
              );
            })`;

code = code.replace(regex, newCode);
fs.writeFileSync('HistoryView.tsx', code);
