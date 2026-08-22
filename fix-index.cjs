const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

const newSkeleton = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#0b0f19;">
        <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg, #4f46e5, #7e22ce);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px rgba(79,70,229,0.3);position:relative;animation:mf-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; margin-bottom: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <div style="color:rgba(255,255,255,0.7); font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; animation: mf-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">Loading Mail Factory...</div>
      </div>
      <style>
        @keyframes mf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      </style>
`;

code = code.replace(/<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#0b0f19;">[\s\S]*?<\/style>/, newSkeleton.trim());
fs.writeFileSync('index.html', code);
