const fs = require('fs');
let code = fs.readFileSync('NotificationDrawer.tsx', 'utf-8');

const regex = /<Info className="w-4 h-4 text-indigo-500" \/>/g;

code = code.replace(regex, `{notif.type === 'error' || notif.type === 'danger' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Info className="w-4 h-4 text-indigo-500" />
                      )}`);

fs.writeFileSync('NotificationDrawer.tsx', code);
