#!/bin/bash
cat << 'INNER_EOF' > temp_replace2.txt
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 font-black text-lg flex items-center justify-center border-2 border-white shadow-md shrink-0">
                    {(profile?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">{profile?.username || 'Mail Factory Seller'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-indigo-200 font-mono block">
                    ID: {userId}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    {language === 'bn' ? 'অফিসিয়াল সেলার ও রেফারার' : 'Official Seller & Referrer'}
                  </span>
                </div>
              </div>
INNER_EOF

# Remove lines from 949 to 962
sed -i '949,962d' ReferralLeaderboard.tsx

# Insert new text
sed -i '948r temp_replace2.txt' ReferralLeaderboard.tsx
