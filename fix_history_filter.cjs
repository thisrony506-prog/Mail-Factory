const fs = require('fs');
let code = fs.readFileSync('HistoryView.tsx', 'utf-8');

code = code.replace(
  /<option value="pending">\{t\.pending\}<\/option>/g,
  '<option value="pending">{t.pending}</option>\n              <option value="checking">Checking</option>'
);

fs.writeFileSync('HistoryView.tsx', code);
