'use client';

import { Card, Skeleton } from 'antd';

const ChartBarsSkeleton = () => {
  const bars = [30, 70, 50, 60, 85, 65, 75, 55];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '100%',
        gap: 10,
        padding: '0 8px',
      }}
    >
      {bars.map((h, i) => (
        <Skeleton.Node
          key={i}
          active
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: 6,
          }}
        />
      ))}
    </div>
  );
};

export default function CheckInOverviewSkeleton() {
  return (
    <Card
      style={{
        borderRadius: 12,
      }}
    >
      {/* Title */}
      <Skeleton.Input
        active
        size="small"
        style={{ width: 180, marginBottom: 20 }}
      />

      {/* Chart Area */}
      <div
        style={{
          width: '100%',
          height: 300,
        }}
      >
        <ChartBarsSkeleton />
      </div>
    </Card>
  );
}