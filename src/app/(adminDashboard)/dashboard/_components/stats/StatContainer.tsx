"use client";
import StatCard from "@/components/(adminDashboard)/cards/statCard";
import StatsCardSkeleton from "@/components/shared/StatCardSkeleton";
import { useGetAttendanceStatsQuery } from "@/redux/api/usersApi";
import React from "react";



export default function StatContainer() {
  const { data, isLoading } = useGetAttendanceStatsQuery(undefined);
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
      title: "Checked-in",
      amount: data?.data?.checkedIn || "0",
      image: "/icon_2.png",
    },
    {
      id: 3,
      title: "Not Arrived",
      amount: data?.data?.notArrived || "0",
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
