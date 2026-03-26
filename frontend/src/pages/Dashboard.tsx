import { TrendingUp, Users, IndianRupee, Award, Building2 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { departmentPlacements, selectionFunnelData } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const FUNNEL_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const totalPlaced = departmentPlacements.reduce((a, b) => a + b.placed, 0);
const totalStudents = departmentPlacements.reduce((a, b) => a + b.total, 0);
const placementPct = ((totalPlaced / totalStudents) * 100).toFixed(1);

export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-description">Campus Placement Analytics — Academic Year 2024-25</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard
          title="Placement Rate"
          value={`${placementPct}%`}
          subtitle={`${totalPlaced} of ${totalStudents} students`}
          icon={TrendingUp}
          variant="primary"
          trend={{ value: 4.2, label: "vs last year" }}
        />
        <KpiCard
          title="Highest CTC"
          value="₹30.0 LPA"
          subtitle="Google — CSE"
          icon={Award}
          variant="success"
        />
        <KpiCard
          title="Average CTC"
          value="₹6.7 LPA"
          subtitle="Across all departments"
          icon={IndianRupee}
          variant="default"
          trend={{ value: 8.1, label: "vs last year" }}
        />
        <KpiCard
          title="Companies Visited"
          value="48"
          subtitle="12 new this season"
          icon={Building2}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Department-wise Placements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPlacements} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="placed" name="Placed" radius={[4, 4, 0, 0]}>
                {departmentPlacements.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Selection Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Funnel dataKey="count" data={selectionFunnelData} isAnimationActive>
                {selectionFunnelData.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[i]} />
                ))}
                <LabelList position="right" fill="hsl(var(--muted-foreground))" fontSize={12} dataKey="stage" />
                <LabelList position="center" fill="hsl(var(--card))" fontSize={13} fontWeight={600} dataKey="count" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
