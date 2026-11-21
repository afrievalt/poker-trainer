import { StatsTable } from '@components/Stats/StatsTable';
import React from 'react';

interface StatsSectionProps {
  title: string;
  isAllTime?: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  isAllTime = false,
}) => (
  <section className="rounded-lg bg-white p-3 shadow">
    <h2 className="mb-2 font-bold text-gray-900">{title}</h2>
    <StatsTable isAllTime={isAllTime} />
  </section>
);
