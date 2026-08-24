const fs = require('fs');
let code = fs.readFileSync('NotificationDrawer.tsx', 'utf-8');

const regex = /\{notif\.type === 'error' \|\| notif\.type === 'danger' \? \([\s\S]*?\} \)/g;

code = code.replace(/:\s*\(\s*\{notif\.type === 'error' \|\| notif\.type === 'danger' \? \(\s*<AlertTriangle className="w-4 h-4 text-rose-500" \/>\s*\) :\s*\(\s*<Info className="w-4 h-4 text-indigo-500" \/>\s*\)\s*\}\s*\)/g, `: (notif.type === 'error' || notif.type === 'danger') ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Info className="w-4 h-4 text-indigo-500" />
                        )`);

fs.writeFileSync('NotificationDrawer.tsx', code);
