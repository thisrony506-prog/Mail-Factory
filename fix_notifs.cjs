const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const regex = /setNotifications\(prev => \{[\s\S]*?const newNotifs = fbNotifs\.filter\(n => !existingIds\.has\(n\.id\)\);[\s\S]*?if \(newNotifs\.length > 0\) \{[\s\S]*?const updated = \[\.\.\.newNotifs, \.\.\.prev\]\.sort\(\(a, b\) => b\.timestamp - a\.timestamp\)\.slice\(0, 50\);[\s\S]*?localStorage\.setItem\('mf_notifications_v2', JSON\.stringify\(updated\)\);[\s\S]*?return updated;[\s\S]*?\}[\s\S]*?return prev;[\s\S]*?\}\);/g;

const replacement = `setNotifications(prev => {
                  const existingIds = new Set(prev.map(n => n.id));
                  const newNotifs = fbNotifs.filter(n => !existingIds.has(n.id));
                  if (newNotifs.length > 0) {
                    const updated = [...newNotifs, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
                    localStorage.setItem('mf_notifications_v2', JSON.stringify(updated));
                    
                    // Trigger web push for real-time notifications
                    try {
                      if ('Notification' in window && (window as any).Notification.permission === 'granted') {
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.ready.then((registration) => {
                            if (registration && registration.showNotification) {
                              newNotifs.forEach(n => {
                                // Only show push for recent notifications (last 2 minutes)
                                if (Date.now() - (n.timestamp || 0) < 120000) {
                                  registration.showNotification('Mail Factory', { body: \`\${n.title}: \${n.desc}\`, icon: appLogo }).catch(console.error);
                                }
                              });
                            }
                          }).catch(console.error);
                        }
                      }
                    } catch (e) { console.error('Push err', e); }
                    
                    return updated;
                  }
                  return prev;
                });`;

code = code.replace(regex, replacement);
fs.writeFileSync('AppContext.tsx', code);
