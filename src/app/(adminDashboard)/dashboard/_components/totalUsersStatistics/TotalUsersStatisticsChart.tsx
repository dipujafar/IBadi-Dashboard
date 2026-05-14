"use client";
import { useState } from "react";
import { useGetChartDataQuery } from "@/redux/api/dashboardApi";
import { Card } from "@/components/ui/card";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Spin } from "antd";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold" style={{ color: "#00C0B5" }}>
                    {payload[0].value} users
                </p>
            </div>
        );
    }
    return null;
};

export default function TotalUsersStatisticsChart() {
    const [year, setYear] = useState<number>(CURRENT_YEAR);

    const { data, isLoading } = useGetChartDataQuery({ year });

    const userData = data?.data?.userData || [];
    const total = userData.reduce(
        (sum: number, item: { total: number }) => sum + item.total,
        0
    );
    const peak = Math.max(...userData.map((item: { total: number }) => item.total), 0);

    return (
        <Card className="rounded-2xl lg:p-8 p-4 w-full">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                        Total Users Statistics
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {total.toLocaleString()}
                    </h1>
                    <span
                        className="inline-flex items-center gap-1 mt-1 text-xs font-medium"
                        style={{ color: "#00C0B5" }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                        </svg>
                        Registered users
                    </span>
                </div>

                {/* Right side: summary pills + year select */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                            <p className="text-gray-400 mb-0.5">Peak</p>
                            <p className="font-semibold text-gray-700">{peak}</p>
                        </div>
                        <div
                            className="rounded-lg px-3 py-2 text-center"
                            style={{ backgroundColor: "#00C0B510" }}
                        >
                            <p className="mb-0.5" style={{ color: "#00C0B5CC" }}>Total</p>
                            <p className="font-semibold" style={{ color: "#00C0B5" }}>{total}</p>
                        </div>
                    </div>

                    {/* Year selector */}
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="text-sm font-medium rounded-lg px-3 py-1.5 border border-gray-200 bg-white text-gray-700 cursor-pointer outline-none transition-all"
                        style={{ boxShadow: "none" }}
                        onFocus={(e) => (e.target.style.borderColor = "#00C0B5")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    >
                        {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            {isLoading ? (
                <div className="h-[260px] flex justify-center items-center">
                    <Spin size="large" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={userData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        barCategoryGap="35%"
                    >
                        <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />

                        <XAxis
                            dataKey="month"
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <YAxis
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            allowDecimals={false}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "#00C0B508" }}
                        />

                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                            {userData.map((entry: { total: number }, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.total === peak && peak > 0
                                            ? "#00C0B5"
                                            : "#00C0B530"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}