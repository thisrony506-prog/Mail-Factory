const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const targetStr = `submissions.forEach(sub => {
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
    });

    withdrawRequests.forEach(wd => {
        if (wd.userId !== user.uid) return;
        const wStatus = (wd.status || '').toLowerCase();
        
        if ((wStatus === 'approved' || wStatus === 'rejected') && !wd.processedForBalance) {
            updates[\`withdraw_requests/\${wd.key}/processedForBalance\`] = true;
        }
    });`;

const replaceStr = `submissions.forEach(sub => {
        if (sub.userId !== user.uid) return;
        const sStatus = (sub.status || '').toLowerCase();
        
        // Generate checking notification
        if (sStatus === 'checking' && !sub.notifiedChecking) {
            updates[\`submissions/\${sub.key}/notifiedChecking\`] = true;
            const nKey = push(ref(db, \`users/\${user.uid}/notifications\`)).key;
            updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                title: 'Review Started 🔍',
                desc: \`Your submission of \${sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1)} Gmails is now being checked.\`,
                type: 'info',
                read: false,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            };
        }

        if ((sStatus === 'approved' || sStatus === 'rejected') && !sub.processedForBalance) {
            updates[\`submissions/\${sub.key}/processedForBalance\`] = true;
            if (sStatus === 'approved' || sStatus === 'rejected') {
                holdDelta -= sub.totalAmount;
            }
            const nKey = push(ref(db, \`users/\${user.uid}/notifications\`)).key;
            if (sStatus === 'approved') {
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Submission Approved 🎉',
                    desc: \`Your submission of \${sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1)} Gmails has been approved! ৳\${sub.totalAmount} added to your balance.\`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (sStatus === 'rejected') {
                const reason = sub.rejectReason || sub.rejectionReason || sub.reason || sub.adminNote || sub.note || 'Not specified';
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Submission Rejected ❌',
                    desc: \`Your submission of \${sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1)} Gmails was rejected. Reason: \${reason}.\`,
                    type: 'danger',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            }
        }
    });

    withdrawRequests.forEach(wd => {
        if (wd.userId !== user.uid) return;
        const wStatus = (wd.status || '').toLowerCase();
        
        if ((wStatus === 'approved' || wStatus === 'rejected') && !wd.processedForBalance) {
            updates[\`withdraw_requests/\${wd.key}/processedForBalance\`] = true;
            const nKey = push(ref(db, \`users/\${user.uid}/notifications\`)).key;
            if (wStatus === 'approved') {
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Withdrawal Approved 💸',
                    desc: \`Your withdrawal of ৳\${wd.amount} via \${wd.paymentMethod || wd.method || 'System'} has been successfully paid out!\`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (wStatus === 'rejected') {
                const reason = wd.rejectReason || wd.rejectionReason || wd.reason || wd.adminNote || wd.transactionNote || 'Not specified';
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Withdrawal Rejected ❌',
                    desc: \`Your withdrawal of ৳\${wd.amount} was rejected. Reason: \${reason}. The funds have been refunded to your balance.\`,
                    type: 'danger',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            }
        }
    });`;

if (code.includes("Client-side only tracks state")) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('AppContext.tsx', code);
  console.log("Updated!");
} else {
  console.log("Not found.");
}
