import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Search } from "lucide-react";
import { students } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function DataManagement() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    branch: "",
    batch: "2025",
    cgpa: "",
    skills: "",
    internship: "",
    company: "",
    ctc: "",
    stipend: "",
    eventDate: "",
    placementStatus: "Unplaced",
  });

  const handleSubmit = () => {
    if (!form.name || !form.rollNo || !form.branch) {
      toast({ title: "Validation Error", description: "Name, Roll No, and Branch are required.", variant: "destructive" });
      return;
    }
    const ctcVal = form.ctc ? parseFloat(form.ctc) : undefined;
    if (form.ctc && isNaN(ctcVal!)) {
      toast({ title: "Validation Error", description: "CTC must be a valid decimal (e.g. 6.0).", variant: "destructive" });
      return;
    }
    toast({ title: "Student Added", description: `${form.name} has been added successfully. (Demo — connect Flask backend to persist.)` });
    setDialogOpen(false);
    setForm({ name: "", rollNo: "", branch: "", batch: "2025", cgpa: "", skills: "", internship: "", company: "", ctc: "", stipend: "", eventDate: "", placementStatus: "Unplaced" });
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Management</h1>
          <p className="page-description">Upload and manage student records and company details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Student Record</DialogTitle>
                <DialogDescription>Enter student details. CTC accepts decimals (e.g. 6.0). Event Date must be YYYY-MM-DD.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rollNo">Roll No *</Label>
                    <Input id="rollNo" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Branch *</Label>
                    <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
                      <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        {["CSE", "CSBS", "IT", "ECE", "ME", "CE", "EE"].map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Batch</Label>
                    <Select value={form.batch} onValueChange={(v) => setForm({ ...form, batch: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["2024", "2025", "2026"].map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input id="cgpa" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Java, Python, ML" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="internship">Internship Details</Label>
                  <Input id="internship" value={form.internship} onChange={(e) => setForm({ ...form, internship: e.target.value })} placeholder="Company (Duration)" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ctc">CTC (LPA)</Label>
                    <Input id="ctc" type="number" step="0.1" min="0" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} placeholder="6.0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stipend">Stipend (LPA)</Label>
                    <Input id="stipend" type="number" step="0.1" min="0" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="0.2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input id="eventDate" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Company Placed At</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Placement Status</Label>
                  <Select value={form.placementStatus} onValueChange={(v) => setForm({ ...form, placementStatus: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Placed">Placed</SelectItem>
                      <SelectItem value="Unplaced">Unplaced</SelectItem>
                      <SelectItem value="In Process">In Process</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Student Records</TabsTrigger>
          <TabsTrigger value="companies">Company Details</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="chart-container overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.rollNo}</TableCell>
                    <TableCell>{s.branch}</TableCell>
                    <TableCell>{s.cgpa}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.skills.slice(0, 3).map((sk) => (
                          <Badge key={sk} variant="secondary" className="text-xs">{sk}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{s.internship}</TableCell>
                    <TableCell>
                      <Badge variant={s.placementStatus === "Placed" ? "default" : s.placementStatus === "In Process" ? "secondary" : "destructive"}>
                        {s.placementStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="companies">
          <div className="chart-container">
            <p className="text-sm text-muted-foreground">Company job offer management will connect to your Flask backend API. Data shown is illustrative.</p>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Offers</TableHead>
                  <TableHead className="text-right">Avg CTC (LPA)</TableHead>
                  <TableHead className="text-right">Highest CTC (LPA)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { company: "TCS", offers: 45, avgCTC: 4.5, highestCTC: 7.0 },
                  { company: "Infosys", offers: 38, avgCTC: 4.8, highestCTC: 8.0 },
                  { company: "Microsoft", offers: 8, avgCTC: 18.0, highestCTC: 24.0 },
                  { company: "Google", offers: 3, avgCTC: 22.0, highestCTC: 30.0 },
                  { company: "Amazon", offers: 12, avgCTC: 14.5, highestCTC: 20.0 },
                ].map((c) => (
                  <TableRow key={c.company}>
                    <TableCell className="font-medium">{c.company}</TableCell>
                    <TableCell className="text-right">{c.offers}</TableCell>
                    <TableCell className="text-right">₹{c.avgCTC}</TableCell>
                    <TableCell className="text-right">₹{c.highestCTC}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
