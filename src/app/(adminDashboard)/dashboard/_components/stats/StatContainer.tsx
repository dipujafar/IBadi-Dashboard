"use client";
import StatCard from "@/components/(adminDashboard)/cards/statCard";
import StatsCardSkeleton from "@/components/shared/StatCardSkeleton";
import { useGetStatQuery } from "@/redux/api/dashboardApi";
import React from "react";



export default function StatContainer() {
  const { data, isLoading } = useGetStatQuery(undefined);
  console.log(data?.data);

  if (isLoading) return <StatsCardSkeleton />;


  const statData = [
    {
      id: 1,
      title: "Total Users",
      amount: data?.data?.totalUsers || "0",
      image: "/icon_1.png",
    },
    {
      id: 2,
      title: "Total Service Provider",
      amount: data?.data?.totalServiceProvider || "0",
      image: "/icon_2.png",
    },
    {
      id: 3,
      title: "Total Earning",
      amount: `$${data?.data?.totalEarnings || "0"}`,
      image: "/icon_3.png",
    }
  ];
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 xl:gap-5 gap-3">
      {statData?.map((item) => (
        <div key={item.id}>
          <StatCard {...item} />
        </div>
      ))}
    </div>
  );
}
