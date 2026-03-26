import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Presentation, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  User, 
  Users, 
  Clock, 
  Bell,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { students, pipelinedCompanies } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock Training Data
interface Training {
  id: string;
  topic: string;
  date: string;
  time: string;
  mentor: string;
  targetBatch: string;
  status: "Upcoming" | "Completed";
  notified: boolean;
}

const initialTrainings: Training[] = [
  {
    id: "t-1",
    topic: "System Design Fundamentals",
    date: "2025-05-18",
    time: "14:00",
    mentor: "Arjun Nair",
    targetBatch: "2025",
    status: "Upcoming",
    notified: true,
  },
  {
    id: "t-2",
    topic: "Advanced React Patterns",
    date: "2025-05-12",
    time: "10:30",
    mentor: "Subhamoy Das",
    targetBatch: "2024",
    status: "Completed",
    notified: true,
  },
];

export default function SkillGapTrainings() {
  const [trainings, setTrainings] = useState(initialTrainings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGapSkill, setSelectedGapSkill] = useState<string | null>(null);

  // 1. Data Processing for Chart
  const skillGapData = useMemo(() => {
    const allSkills = Array.from(new Set([
      ...students.flatMap(s => s.skills),
      ...pipelinedCompanies.flatMap(c => c.skills)
    ]));

    return allSkills.map(skill => {
      const demand = pipelinedCompanies.filter(c => c.skills.includes(skill)).length;
      const supply = students.filter(s => s.skills.includes(skill)).length;
      return {
        name: skill,
        demand: demand,
        supply: supply,
        gap: Math.max(0, demand * 3 - supply) // Simplified gap logic: each company wants roughly 3 proficient students?
      };
    }).sort((a, b) => (b.demand - a.demand)).slice(0, 8);
  }, []);

  // 1.1 Data Processing for Skill Distribution (Pie Chart)
  const skillDistributionData = useMemo(() => {
    const skillCounts: Record<string, number> = {};
    let totalSkills = 0;

    students.forEach(student => {
      student.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        totalSkills++;
      });
    });

    return Object.entries(skillCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / totalSkills) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 skills for the pie chart
  }, []);

  const PIE_COLORS = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#FFCC00'];

  // 2. Identify Priority Training (Skill with largest demand-supply delta)
  const prioritySkill = useMemo(() => {
    return [...skillGapData].sort((a, b) => (b.demand - a.supply) - (a.demand - b.supply))[0];
  }, [skillGapData]);

  const shortfallPercent = useMemo(() => {
    if (!prioritySkill) return 0;
    const totalPotential = prioritySkill.demand * 5; // Assumed multiplier
    return Math.min(100, Math.round(((totalPotential - prioritySkill.supply) / totalPotential) * 100));
  }, [prioritySkill]);

  const handleScheduleTraining = (skillName: string) => {
    setSelectedGapSkill(skillName);
    setIsModalOpen(true);
  };

  const handleNotify = (id: string) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, notified: true } : t));
    toast.success("Notification sent to eligible students!");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F]">Skill Gap & Trainings</h1>
          <p className="text-muted-foreground mt-1">Strategic workforce development based on industry demand.</p>
        </div>
        <Button onClick={() => handleScheduleTraining("")} className="rounded-full gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Schedule Manually
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Left: Demand vs Supply Chart */}
        <Card className="lg:col-span-2 shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Demand vs. Proficiency</CardTitle>
            <CardDescription>Comparison of company requirements vs. student skill sets</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="demand" name="Company Demand" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="supply" name="Student Proficiency" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Right: Gap Alert Widget */}
        <Card className="shadow-xl border-none bg-gradient-to-br from-red-50 to-orange-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle size={120} />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Priority Training
            </CardTitle>
            <CardDescription className="text-orange-950/60">Urgent gap identified in market demand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-orange-950">{prioritySkill?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {shortfallPercent}% Shortfall
                </span>
                <span className="text-xs text-muted-foreground italic">Critical Delta</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on the latest drive data from <strong>{prioritySkill?.demand}</strong> companies, current student proficiency in <strong>{prioritySkill?.name}</strong> is critically low.
            </p>

            <Button 
              onClick={() => handleScheduleTraining(prioritySkill?.name || "")}
              className="w-full bg-[#1D1D1F] hover:bg-black text-white rounded-xl h-12 shadow-md flex items-center justify-center gap-2"
            >
              Schedule Training <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Skills Distribution Section with Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Overall Student Skill Distribution</CardTitle>
            <CardDescription>Percentage share of top skills possessed by the student body</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <div className="w-full h-full flex flex-col md:flex-row items-center justify-around">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {skillDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [`${value} Students (${props.payload.percentage}%)`, name]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full md:w-1/2 grid grid-cols-2 gap-4 px-4">
                {skillDistributionData.map((skill, index) => (
                  <div key={skill.name} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                      <span className="text-xs text-slate-500">{skill.percentage}% ({skill.value} Students)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-blue-600 text-white overflow-hidden flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-white">Skill Synergy</CardTitle>
            <CardDescription className="text-blue-100">Most common tech combinations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Frontend Stack</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">React + Node.js</span>
                <Badge className="bg-white/20 text-white border-none">42%</Badge>
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Backend Stack</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Java + SQL</span>
                <Badge className="bg-white/20 text-white border-none">38%</Badge>
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Data Science</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Python + ML</span>
                <Badge className="bg-white/20 text-white border-none">25%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Upcoming Trainings */}
      <Card className="shadow-sm border-none bg-white">
        <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Upcoming Training Programs</CardTitle>
            <CardDescription>Scheduled sessions to bridge identified skill gaps</CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {trainings.filter(t => t.status === "Upcoming").length} Planned Sessions
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {trainings.map((training) => (
              <div key={training.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                    training.status === "Upcoming" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Presentation className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1D1D1F] text-lg">{training.topic}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {training.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {training.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {training.mentor}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn(
                      "rounded-full px-4 py-1",
                      training.status === "Upcoming" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                    )}>
                      {training.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Notify Students</span>
                      <Switch 
                        checked={training.notified} 
                        onCheckedChange={() => handleNotify(training.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Airbnb Style Scheduler Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[24px] border-none shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black underline decoration-blue-500 decoration-4 underline-offset-4">
              Schedule Strategic Training
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Fill in the details to bridge the skill gap and notify students.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Training Topic</Label>
                <Input 
                  defaultValue={selectedGapSkill ? `${selectedGapSkill} Mastering Workshop` : ""} 
                  className="rounded-xl border-slate-200 h-12 focus:ring-blue-500"
                  placeholder="e.g. Distributed Systems Mastery"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</Label>
                <Input type="date" className="rounded-xl border-slate-200 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Time</Label>
                <Input type="time" className="rounded-xl border-slate-200 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mentor</Label>
                <Input className="rounded-xl border-slate-200 h-12" placeholder="Mentor Name" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Target Batch</Label>
                <Select defaultValue="2025">
                  <SelectTrigger className="rounded-xl border-slate-200 h-12">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">Batch 2024</SelectItem>
                    <SelectItem value="2025">Batch 2025</SelectItem>
                    <SelectItem value="2026">Batch 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-8 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-full font-bold text-slate-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsModalOpen(false);
                toast.success("Training scheduled successfully!");
              }}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/30"
            >
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
