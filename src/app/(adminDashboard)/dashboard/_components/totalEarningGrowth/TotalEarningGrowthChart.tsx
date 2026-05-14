"use client";
import { useState } from "react";
import { useGetChartDataQuery } from "@/redux/api/dashboardApi";
import { Card } from "@/components/ui/card";
import {
    Area,
    AreaChart,
    CartesianGrid,
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
                    ${payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export default function TotalEarningGrowthChart() {
    const [incomeYear, setIncomeYear] = useState<number>(CURRENT_YEAR);

    const { data, isLoading } = useGetChartDataQuery({ incomeYear });

    const paymentData = data?.data?.paymentData || [];
    const total = paymentData.reduce(
        (sum: number, item: { total: number }) => sum + item.total,
        0
    );

    return (
        <Card className="rounded-2xl lg:p-8 p-4 w-full">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                        Total Earning Growth
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800">
                        ${total.toLocaleString()}
                    </h1>
                    <span
                        className="inline-flex items-center gap-1 mt-1 text-xs font-medium"
                        style={{ color: "#00C0B5" }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                        </svg>
                        {incomeYear}
                    </span>
                </div>

                {/* Right side: legend + year select */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#00C0B5" }}
                        />
                        Revenue
                    </div>

                    {/* Year selector */}
                    <select
                        value={incomeYear}
                        onChange={(e) => setIncomeYear(Number(e.target.value))}
                        className="text-sm font-medium rounded-lg px-3 py-1.5 border border-gray-200 bg-white text-gray-700 cursor-pointer outline-none transition-all"
                        style={{
                            boxShadow: "none",
                            accentColor: "#00C0B5",
                        }}
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
                    <AreaChart
                        data={paymentData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="earningGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00C0B5" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#00C0B5" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>

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
                            tickFormatter={(v) => `$${v}`}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: "#00C0B5", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />

                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#00C0B5"
                            strokeWidth={2}
                            fill="url(#earningGradient)"
                            dot={false}
                            activeDot={{ r: 5, fill: "#00C0B5", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}