import { StatsSummary } from './StatsSummary';
import { CreditsProgressBar } from './CreditsProgressBar';
import { TrendChart } from './TrendChart';
import { DegreeProjector } from './DegreeProjector';
import { WhatDoINeedCalculator } from './WhatDoINeedCalculator';
import { BestWorstStats } from './BestWorstStats';

export function DashboardPage() {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <StatsSummary />
      <CreditsProgressBar />
      <TrendChart />
      <div className="two-col">
        <DegreeProjector />
        <WhatDoINeedCalculator />
      </div>
      <BestWorstStats />
    </div>
  );
}
