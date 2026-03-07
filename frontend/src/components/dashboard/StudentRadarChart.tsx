import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StudentRadarChartProps {
  skills: string[];
}

export function StudentRadarChart({ skills }: StudentRadarChartProps) {
  // Generate mock score data for the skills since our mock data doesn't have skill levels yet
  // In a real app, this would come from the student's profile
  // Using a deterministic random based on skill name length to keep it consistent-ish
  const data = skills.map((skill) => ({
    subject: skill,
    A: 60 + (skill.length * 5) % 40, // Random score between 60-100
    fullMark: 100,
  }));

  // Ensure we have at least 3 points for the radar chart to look good
  // If less than 3, add placeholders
  const chartData = [...data];
  if (chartData.length > 0 && chartData.length < 3) {
    if (chartData.length === 1) {
      chartData.push({ subject: "General", A: 70, fullMark: 100 });
      chartData.push({ subject: "Aptitude", A: 75, fullMark: 100 });
    } else if (chartData.length === 2) {
      chartData.push({ subject: "Aptitude", A: 75, fullMark: 100 });
    }
  }

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No skills data</div>;
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Skill Level"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px"
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
