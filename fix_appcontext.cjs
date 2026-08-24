const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const regex = /submissions\.forEach\(sub => \{[\s\S]*?\}\);/g;

code = code.replace(regex, `submissions.forEach(sub => {
        if (sub.userId !== user.uid) return;
        const sStatus = (sub.status || '').toLowerCase();
        
        // Let Cloud Functions handle all logic (push notifications + balance)
        // Client-side only tracks state
        if ((sStatus === 'approved' || sStatus === 'rejected') && !sub.processedForBalance) {
            updates[\`submissions/\${sub.key}/processedForBalance\`] = true;
            // holdDelta handling is done via submission creation and client-side reconciliation.
            if (sStatus === 'approved' || sStatus === 'rejected') {
                holdDelta -= sub.totalAmount;
            }
        }
    });`);

const wdRegex = /withdrawRequests\.forEach\(wd => \{[\s\S]*?\}\);/g;

code = code.replace(wdRegex, `withdrawRequests.forEach(wd => {
        if (wd.userId !== user.uid) return;
        const wStatus = (wd.status || '').toLowerCase();
        
        if ((wStatus === 'approved' || wStatus === 'rejected') && !wd.processedForBalance) {
            updates[\`withdraw_requests/\${wd.key}/processedForBalance\`] = true;
        }
    });`);

fs.writeFileSync('AppContext.tsx', code);
