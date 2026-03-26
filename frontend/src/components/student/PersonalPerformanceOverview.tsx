import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

export function PersonalPerformanceOverview() {
    const { user, isAuthenticated } = useAuth();
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const tokenString = localStorage.getItem("cpas_tokens");
                const token = tokenString ? JSON.parse(tokenString).access_token : "";

                const response = await fetch('/api/student/performance', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPerformanceData(data);
                } else {
                    setPerformanceData([]);
                }
            } catch (error) {
                console.error("Failed to fetch performance data:", error);
                setPerformanceData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [isAuthenticated]);

    if (!loading && performanceData.length === 0) {
        return (
            <div className="w-full h-full min-h-[250px] flex items-center justify-center text-muted-foreground">
                No performance data yet
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickMargin={10}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
