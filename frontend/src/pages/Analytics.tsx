import { useState, useMemo } from "react";
import { students } from "@/data/mockData";
import { KPICards } from "@/components/analytics/KPICards";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { DepartmentChart } from "@/components/analytics/DepartmentChart";
import { TrendsChart } from "@/components/analytics/TrendsChart";
import { SummaryReport } from "@/components/analytics/SummaryReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function Analytics() {
  const [packageRange, setPackageRange] = useState([0, 50]);
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // Filter Data
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // 1. Filter by Package Range (CTCs) 
      // If unplaced (ctc undefined/0), we still include them in the pool unless the user asks for > 0 range implicitly?
      // Actually, typically package range filters only apply to placed students or filters OUT unplaced if range > 0.
      // Let's say range [0, 50] includes everyone. Range [5, 50] excludes those < 5 (including 0).
      const ctc = s.ctc || 0;
      const matchPackage = ctc >= packageRange[0] && ctc <= packageRange[1];

      // 2. Filter by Skill
      const matchSkill = selectedSkill === "All" || s.skills.includes(selectedSkill);

      // 3. Filter by Year
      const matchYear = selectedYear === "All" || s.batch === selectedYear;

      return matchPackage && matchSkill && matchYear;
    });
  }, [packageRange, selectedSkill, selectedYear]);

  // Key Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const placed = filteredStudents.filter(s => s.placementStatus === "Placed").length;
    // Calculate avg CTC only for placed students
    const placedStudents = filteredStudents.filter(s => s.placementStatus === "Placed" && s.ctc);
    const totalCTC = placedStudents.reduce((acc, curr) => acc + (curr.ctc || 0), 0);
    const avgCTC = placedStudents.length > 0 ? totalCTC / placedStudents.length : 0;

    return {
      total,
      placed,
      avgCTC,
      placementPercentage: total > 0 ? (placed / total) * 100 : 0
    };
  }, [filteredStudents]);

  // Derived Data for Charts
  const departmentData = useMemo(() => {
    const map = new Map<string, { total: number; placed: number; unplaced: number; totalCTC: number }>();

    filteredStudents.forEach(s => {
      if (!map.has(s.branch)) {
        map.set(s.branch, { total: 0, placed: 0, unplaced: 0, totalCTC: 0 });
      }
      const entry = map.get(s.branch)!;
      entry.total++;
      if (s.placementStatus === "Placed") {
        entry.placed++;
        entry.totalCTC += (s.ctc || 0);
      } else {
        entry.unplaced++;
      }
    });

    return Array.from(map.entries()).map(([department, stats]) => ({
      department,
      placed: stats.placed,
      unplaced: stats.unplaced,
      total: stats.total,
      avgCTC: stats.placed > 0 ? stats.totalCTC / stats.placed : 0
    }));
  }, [filteredStudents]);

  const trendsData = useMemo(() => {
    // Group by Month-Year
    const map = new Map<string, number>();

    filteredStudents
      .filter(s => s.placementStatus === "Placed" && s.eventDate)
      .forEach(s => {
        const date = new Date(s.eventDate!);
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., Dec 24
        // To sort correctly, we might need a sortable key, but for simple display:
        // Let's store logic to sort later.
        map.set(key, (map.get(key) || 0) + 1);
      });

    // We need to valid sort these keys chronologically.
    // Hacky way: parse the date back or rely on input data being roughly sorted or small range.
    // Better: Sort by actual date timestamp first.
    const sorted = filteredStudents
      .filter(s => s.placementStatus === "Placed" && s.eventDate)
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
      .map(s => {
        const d = new Date(s.eventDate!);
        return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(2)}`;
      });

    // De-dupe and count
    const uniqueKeys = [...new Set(sorted)];
    return uniqueKeys.map(key => ({
      month: key,
      placements: sorted.filter(k => k === key).length
    }));

  }, [filteredStudents]);

  const topCompanies = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.filter(s => s.placementStatus === "Placed" && s.company).forEach(s => {
      map.set(s.company!, (map.get(s.company!) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([company, offers]) => ({ company, offers }))
      .sort((a, b) => b.offers - a.offers)
      .slice(0, 5);
  }, [filteredStudents]);

  // Lists for Filters
  const allSkills = useMemo(() => Array.from(new Set(students.flatMap(s => s.skills))).sort(), []);
  const allYears = useMemo(() => Array.from(new Set(students.map(s => s.batch))).sort(), []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">Management Analytics</h1>
          <p className="page-description">High-level insights and performance metrics</p>
        </div>
        <Button variant="outline" className="gap-2 print:hidden" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print Report
        </Button>
      </div>

      <div className="print:hidden">
        <AnalyticsFilters
          packageRange={packageRange}
          onPackageRangeChange={setPackageRange}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          availableSkills={allSkills}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={allYears}
          onReset={() => {
            setPackageRange([0, 50]);
            setSelectedSkill("All");
            setSelectedYear("All");
          }}
        />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="print:hidden">
          <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <KPICards
            totalPlaced={metrics.placed}
            averageCTC={metrics.avgCTC}
            placementPercentage={metrics.placementPercentage}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Placements</CardTitle>
                <CardDescription>Placed vs Unplaced students across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentChart data={departmentData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Trends</CardTitle>
                <CardDescription>Monthly placement volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendsChart data={trendsData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <SummaryReport
            departmentStats={departmentData}
            topCompanies={topCompanies}
            filters={{ packageRange, skill: selectedSkill, year: selectedYear }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

