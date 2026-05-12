"use client";
import { Card } from "@/components/ui/card";
import { useGetCheckInEventOverviewQuery } from "@/redux/api/eventApi";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import CheckInOverviewSkeleton from "./skeleton/CheckInOverviewSkeleton";
import { Spin } from "antd";

const checkInOverviewData = [
    { month: "07:00 AM", value: 100 },
    { month: "08:00 AM", value: 310 },
    { month: "09:00 AM", value: 150 },
    { month: "11:00 AM", value: 150 },
    { month: "12:00 PM", value: 180 },
    { month: "01:00 PM", value: 200 },
    { month: "02:00 PM", value: 320 },
    { month: "03:00 PM", value: 230 },
]

const CheckInOverview = () => {
    const { data, isLoading } = useGetCheckInEventOverviewQuery(undefined);

    if (isLoading) return <div className="h-96 flex justify-center items-center"><Spin size="large" /></div>;

    return (
        <Card className="rounded-lg lg:p-8 p-2 w-full overflow-x-auto">
            <div className="text-primaryWhite flex lg:flex-wrap xl:flex-nowrap justify-between items-center mb-10 gap-2">
                <h1 className="text-xl text-black font-semibold">Check-in Overview</h1>
            </div>

            <ResponsiveContainer height={300} className={"!w-full overflow-x-auto"}>
                <AreaChart
                    data={data?.data || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="50%" stopColor="#EEDBE0" stopOpacity={1} />
                            <stop offset="100%" stopColor="#F9F3F5" stopOpacity={0.4} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                        dataKey="time"
                    />
                    <YAxis tickMargin={20} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                        activeDot={false}
                        type="monotone"
                        dataKey="count"
                        strokeWidth={1}
                        stroke="#931F39"
                        fill="url(#color)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default CheckInOverview;
