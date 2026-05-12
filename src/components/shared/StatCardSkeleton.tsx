'use client';

import { Card, Skeleton, Row, Col } from 'antd';

const StatCardSkeleton = () => {
  return (
    <Card
      style={{
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left content */}
        <div style={{ flex: 1 }}>
          {/* Title */}
          <Skeleton.Input
            active
            size="small"
            style={{ width: 120, marginBottom: 12 }}
          />

          {/* Value */}
          <Skeleton.Input
            active
            size="large"
            style={{ width: 100 }}
          />
        </div>

        {/* Icon */}
        <Skeleton.Avatar active size={40} shape="square" />
      </div>
    </Card>
  );
};

export default function StatsCardSkeleton() {
  return (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((_, i) => (
        <Col xs={24} sm={12} md={12} lg={6} key={i}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}