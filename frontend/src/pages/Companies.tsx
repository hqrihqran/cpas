import { companyData, selectionFunnelData } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sorted = [...companyData].sort((a, b) => b.offers - a.offers);

export default function Companies() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Company Insights</h1>
        <p className="page-description">Hiring trends and company-wise analysis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Offers by Company</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="company" type="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="offers" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Company Details</h3>
          <div className="overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Offers</TableHead>
                  <TableHead className="text-right">Avg CTC</TableHead>
                  <TableHead className="text-right">Highest CTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c) => (
                  <TableRow key={c.company}>
                    <TableCell className="font-medium">{c.company}</TableCell>
                    <TableCell className="text-right">{c.offers}</TableCell>
                    <TableCell className="text-right">₹{c.avgCTC} LPA</TableCell>
                    <TableCell className="text-right">₹{c.highestCTC} LPA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
