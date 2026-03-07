import { useState, useMemo } from "react";
import { students, departmentPlacements } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const branches = ["All", ...new Set(students.map((s) => s.branch))];
const batches = ["All", ...new Set(students.map((s) => s.batch))];

export default function Reports() {
  const [branch, setBranch] = useState("All");
  const [batch, setBatch] = useState("All");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      return (branch === "All" || s.branch === branch) && (batch === "All" || s.batch === batch);
    });
  }, [branch, batch]);

  const placed = filtered.filter((s) => s.placementStatus === "Placed");
  const totalFiltered = filtered.length;
  const placedCount = placed.length;
  const avgCTC = placed.length ? (placed.reduce((a, b) => a + (b.ctc || 0), 0) / placed.length).toFixed(1) : "0";
  const highestCTC = placed.length ? Math.max(...placed.map((s) => s.ctc || 0)) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-description">Dynamic placement reports with branch and batch filters</p>
      </div>

      <div className="flex gap-3 mb-6">
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={batch} onValueChange={setBatch}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFiltered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Placed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{placedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{avgCTC} LPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">₹{highestCTC} LPA</p>
          </CardContent>
        </Card>
      </div>

      <div className="chart-container">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Placement Summary</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">CTC (LPA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.branch}</TableCell>
                <TableCell>{s.batch}</TableCell>
                <TableCell>{s.cgpa}</TableCell>
                <TableCell>{s.placementStatus}</TableCell>
                <TableCell>{s.company || "—"}</TableCell>
                <TableCell className="text-right">{s.ctc ? `₹${s.ctc}` : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
