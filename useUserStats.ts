import { useMemo } from 'react';
import { useApp } from './AppContext';

export function useUserStats() {
  const { submissions, withdrawRequests, profile } = useApp();

  return useMemo(() => {
    // Basic Submission Counts
    const totalSubCount = submissions.reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1)), 0);
    const approvedCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'approved').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1)), 0);
    const pendingCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'pending' || !s.status).reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1)), 0);
    const checkingCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'checking').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1)), 0);
    const rejectedCount = submissions.filter((s) => (s.status || '').toLowerCase() === 'rejected').reduce((acc, s) => acc + (Number(s.count) || Number(s.quantity) || (s.gmails ? s.gmails.length : 1)), 0);

    // Earnings Data
    const realTotalEarnings = submissions
      .filter((s) => (s.status || '').toLowerCase() === 'approved')
      .reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
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

    const earningsMap: Record<string, number> = {};
    submissions
      .filter((s) => (s.status || '').toLowerCase() === 'approved')
      .forEach((s) => {
        if (!s.submittedAt) return;
        const d = new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        earningsMap[d] = (earningsMap[d] || 0) + (Number(s.totalAmount) || 0);
      });

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
