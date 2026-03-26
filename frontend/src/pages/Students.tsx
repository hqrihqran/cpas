import { useState, useMemo } from "react";
import { students, Student } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, SlidersHorizontal } from "lucide-react";
import { StudentFilters } from "@/components/dashboard/StudentFilters";
import { StudentDetails } from "@/components/dashboard/StudentDetails";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const statusVariant: Record<Student["placementStatus"], "default" | "secondary" | "destructive"> = {
  Placed: "default",
  "In Process": "secondary",
  Unplaced: "destructive",
};

export default function Students() {
  const [search, setSearch] = useState("");

  // Filters
  const [cgpaRange, setCgpaRange] = useState([0, 10]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [hideArrears, setHideArrears] = useState(false);

  // Selection
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Derived Data
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    students.forEach(s => s.skills.forEach(skill => skills.add(skill)));
    return Array.from(skills).sort();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase());

      const matchCgpa = s.cgpa >= cgpaRange[0] && s.cgpa <= cgpaRange[1];

      const matchSkills = selectedSkills.length === 0 ||
        selectedSkills.every(skill => s.skills.includes(skill));

      const matchArrears = !hideArrears || s.currentArrears === 0;

      return matchSearch && matchCgpa && matchSkills && matchArrears;
    });
  }, [search, cgpaRange, selectedSkills, hideArrears]);

  // Categorization Logic
  const topPerformers = useMemo(() => filtered.filter(s => s.cgpa >= 8.5), [filtered]);
  const skillSpecific = useMemo(() => filtered.filter(s => s.skills.length >= 3 && s.cgpa < 8.5), [filtered]); // Just an example logic

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleClearFilters = () => {
    setCgpaRange([0, 10]);
    setSelectedSkills([]);
    setSearch("");
    setHideArrears(false);
  };

  const handleSkillChange = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:block w-64 border-r bg-background p-6 overflow-y-auto">
        <StudentFilters
          skills={allSkills}
          selectedSkills={selectedSkills}
          onSkillChange={handleSkillChange}
          cgpaRange={cgpaRange}
          onCgpaChange={setCgpaRange}
          hideArrears={hideArrears}
          onHideArrearsChange={setHideArrears}
          onClearFilters={handleClearFilters}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Student Tracking</h1>
              <p className="text-muted-foreground">Manage and track student placements.</p>
            </div>

            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="mt-6">
                  <StudentFilters
                    skills={allSkills}
                    selectedSkills={selectedSkills}
                    onSkillChange={handleSkillChange}
                    cgpaRange={cgpaRange}
                    onCgpaChange={setCgpaRange}
                    hideArrears={hideArrears}
                    onHideArrearsChange={setHideArrears}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Stats / Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{filtered.length}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold text-green-600">{topPerformers.length}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Placed</p>
                <p className="text-2xl font-bold text-blue-600">{filtered.filter(s => s.placementStatus === 'Placed').length}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">CGPA</TableHead>
                  <TableHead className="text-right">History</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleStudentClick(s)}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.rollNo}</TableCell>
                    <TableCell>{s.branch}</TableCell>
                    <TableCell className="text-right font-medium">
                      {s.cgpa}
                      {s.cgpa >= 8.5 && (
                        <Badge variant="outline" className="ml-2 text-[10px] border-green-500 text-green-600 px-1 py-0 h-5">Top</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{s.historyOfArrears}</TableCell>
                    <TableCell className={`text-right font-medium ${s.currentArrears > 0 ? "text-red-600" : "text-green-600"}`}>
                      {s.currentArrears}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[s.placementStatus]}>{s.placementStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {s.skills.length >= 3 && s.cgpa < 8.5 && (
                          <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600 px-1 py-0 h-5 mr-1">Skill Star</Badge>
                        )}
                        {s.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="inline-flex items-center rounded-sm border px-1 text-[10px] font-medium text-foreground">{skill}</span>
                        ))}
                        {s.skills.length > 2 && <span className="text-[10px] text-muted-foreground">+{s.skills.length - 2}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleStudentClick(s); }}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No students found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <StudentDetails
        student={selectedStudent}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

