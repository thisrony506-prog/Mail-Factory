const fs = require('fs');
let code = fs.readFileSync('AppContext.tsx', 'utf-8');

const targetStr = `        if ((sStatus === 'approved' || sStatus === 'rejected') && !sub.processedForBalance) {
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
        }`;

const replaceStr = `        if ((sStatus === 'approved' || sStatus === 'rejected') && !sub.processedForBalance) {
            updates[\`submissions/\${sub.key}/processedForBalance\`] = true;
            if (sStatus === 'approved' || sStatus === 'rejected') {
                holdDelta -= sub.totalAmount;
            }
            
            let totalSubmitted = sub.count || sub.quantity || (sub.gmails ? sub.gmails.length : 1);
            let approvedCount = 0;
            let rejectedCount = 0;
            
            if (sub.gmails && sub.gmails.length > 0) {
                sub.gmails.forEach((g) => {
                    const iStatus = (g.status === 'pending' || !g.status ? sStatus : g.status).toLowerCase();
                    if (iStatus === 'approved' || iStatus === 'completed') approvedCount++;
                    if (iStatus === 'rejected') rejectedCount++;
                });
            } else {
                if (sStatus === 'approved' || sStatus === 'completed') approvedCount = totalSubmitted;
                if (sStatus === 'rejected') rejectedCount = totalSubmitted;
            }
            
            const nKey = push(ref(db, \`users/\${user.uid}/notifications\`)).key;
            const reason = sub.rejectReason || sub.rejectionReason || sub.reason || sub.adminNote || sub.note || 'Not specified';
            
            if (approvedCount > 0 && rejectedCount > 0) {
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Submission Processed 📝',
                    desc: \`\${totalSubmitted} Gmails processed: \${approvedCount} Approved (৳\${sub.totalAmount} added), \${rejectedCount} Rejected.\`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (sStatus === 'approved' || sStatus === 'completed') {
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Submission Approved 🎉',
                    desc: \`\${totalSubmitted} Gmails approved! ৳\${sub.totalAmount} added to your balance.\`,
                    type: 'success',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            } else if (sStatus === 'rejected') {
                updates[\`users/\${user.uid}/notifications/\${nKey}\`] = {
                    title: 'Submission Rejected ❌',
                    desc: \`\${totalSubmitted} Gmails rejected. Reason: \${reason}.\`,
                    type: 'danger',
                    read: false,
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                };
            }
        }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('AppContext.tsx', code);
  console.log("Updated!");
} else {
  console.log("Not found.");
}
