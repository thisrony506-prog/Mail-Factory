import { useMemo } from 'react';
import { useApp } from './AppContext';

export function useUserStats() {
  const { submissions, withdrawRequests, profile } = useApp();

  return useMemo(() => {
    // Basic Submission Counts
    let totalSubCount = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let checkingCount = 0;
    let rejectedCount = 0;
    let realTotalEarnings = 0;

    const earningsMap: Record<string, number> = {};

    submissions.forEach((s) => {
      const parentStatus = (s.status || '').toLowerCase();
      let hasIndividualStatus = false;
      let sApprovedCount = 0;
      let sTotalAmount = Number(s.totalAmount) || 0;
      const rate = Number(s.rate) || 0;
      
      if (s.gmails && Array.isArray(s.gmails) && s.gmails.length > 0) {
        s.gmails.forEach((g) => {
          totalSubCount += 1;
          const gStatus = (g.status || parentStatus || 'pending').toLowerCase();
          if (gStatus === 'approved') {
             approvedCount += 1;
             sApprovedCount += 1;
          }
          else if (gStatus === 'rejected') rejectedCount += 1;
          else if (gStatus === 'checking') checkingCount += 1;
          else pendingCount += 1;
          
          if (g.status) hasIndividualStatus = true;
        });
      } else {
        const c = Number(s.count) || Number(s.quantity) || 1;
        totalSubCount += c;
        if (parentStatus === 'approved') {
            approvedCount += c;
            sApprovedCount += c;
        }
        else if (parentStatus === 'rejected') rejectedCount += c;
        else if (parentStatus === 'checking') checkingCount += c;
        else pendingCount += c;
      }

      // Calculate Earnings and Chart Data
      if (sApprovedCount > 0) {
         const earnedAmount = hasIndividualStatus ? (sApprovedCount * rate) : sTotalAmount;
         if (parentStatus === 'approved') {
            realTotalEarnings += earnedAmount;
            if (s.submittedAt) {
              const d = new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              earningsMap[d] = (earningsMap[d] || 0) + earnedAmount;
            }
         }
      }
    });

    const displayEarnings = Math.max(Number(profile?.totalEarnings) || 0, realTotalEarnings);

    // Withdrawn Data
    const realTotalWithdrawn = withdrawRequests
      .filter((w) => (w.status || '').toLowerCase() === 'approved')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const displayWithdrawn = Math.max(Number(profile?.total_withdrawn) || 0, realTotalWithdrawn);

    const hasWithdrawn = Boolean(withdrawRequests && withdrawRequests.some((w) => (w.status || '').toLowerCase() === 'approved' || (w.status || '').toLowerCase() === 'pending'));

    // Chart Data & Peak Earning
    const chartDays: string[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      chartDays.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const chartData = chartDays.map((date) => ({
      date,
      amount: earningsMap[date] || 0,
    }));
    const rangeTotal = chartData.reduce((acc, curr) => acc + curr.amount, 0);
    const rangePeak = Math.max(...chartData.map((d) => d.amount), 0);

    return {
      totalSubCount,
      approvedCount,
      pendingCount,
      checkingCount,
      rejectedCount,
      realTotalEarnings,
      displayEarnings,
      realTotalWithdrawn,
      displayWithdrawn,
      hasWithdrawn,
      chartDays,
      chartData,
      rangeTotal,
      rangePeak,
    };
  }, [submissions, withdrawRequests, profile]);
}
