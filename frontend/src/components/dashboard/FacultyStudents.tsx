import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { students } from "@/data/mockData";

export function FacultyStudents() {
    const [searchTerm, setSearchTerm] = useState("");
    const [cgpaFilter, setCgpaFilter] = useState("all");
    const [arrearFilter, setArrearFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState("all");
    const [placementFilter, setPlacementFilter] = useState("all");

    // Gather unique skills for the filter
    const allSkills = Array.from(new Set(students.flatMap(s => s.skills))).sort();

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCgpa = cgpaFilter === "all" ? true :
            cgpaFilter === "9+" ? student.cgpa >= 9 :
                cgpaFilter === "8-9" ? (student.cgpa >= 8 && student.cgpa < 9) :
                    cgpaFilter === "7-8" ? (student.cgpa >= 7 && student.cgpa < 8) :
                        student.cgpa < 7;

        const matchesArrear = arrearFilter === "all" ? true :
            arrearFilter === "clear" ? (student.historyOfArrears === 0 && student.currentArrears === 0) :
                arrearFilter === "history" ? student.historyOfArrears > 0 :
                    student.currentArrears > 0;

        const matchesSkill = skillFilter === "all" ? true : student.skills.includes(skillFilter);

        const matchesPlacement = placementFilter === "all" ? true :
            placementFilter.toLowerCase() === student.placementStatus.toLowerCase();

        return matchesSearch && matchesCgpa && matchesArrear && matchesSkill && matchesPlacement;
    });

    return (
        <div className="space-y-6 animate-fade-in p-6 lg:p-8 flex flex-col h-[calc(100vh-6rem)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Student Skill Monitoring
                </h1>
                <Button variant="outline" className="gap-2 glass-panel border-white/20 bg-background/50 shadow-sm">
                    <Download className="h-4 w-4" /> Export
                </Button>
            </div>

            {/* Filters - Glassmorphic Bento box styling */}
            <Card className="glass-panel border-white/20 shadow-sm rounded-2xl bg-card/40 backdrop-blur-md">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Name or Roll No..."
                            className="pl-9 bg-background/60 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={skillFilter} onValueChange={setSkillFilter}>
                        <SelectTrigger className="bg-background/60 border-white/10">
                            <SelectValue placeholder="Skill Sets" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Skills</SelectItem>
                            {allSkills.map(skill => (
                                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={placementFilter} onValueChange={setPlacementFilter}>
                        <SelectTrigger className="bg-background/60 border-white/10">
                            <SelectValue placeholder="Placement Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="unplaced">Unplaced</SelectItem>
                            <SelectItem value="in process">In Process</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={arrearFilter} onValueChange={setArrearFilter}>
                        <SelectTrigger className="bg-background/60 border-white/10">
                            <SelectValue placeholder="Arrear Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Arrears</SelectItem>
                            <SelectItem value="clear">All Clear</SelectItem>
                            <SelectItem value="history">History of Arrears</SelectItem>
                            <SelectItem value="current">Current Arrears</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="glass-panel border-white/20 shadow-md rounded-2xl bg-card/40 backdrop-blur-md flex-1 overflow-hidden">
                <div className="h-full overflow-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-sm z-10 border-b border-white/10">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] font-bold">Roll No</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="text-center font-bold">Branch</TableHead>
                                <TableHead className="text-center font-bold">CGPA</TableHead>
                                <TableHead className="text-center font-bold">Arrears (H/C)</TableHead>
                                <TableHead className="font-bold">Top Skills</TableHead>
                                <TableHead className="text-right font-bold w-[120px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-card/40 transition-colors border-white/5">
                                    <TableCell className="font-medium font-mono text-xs">{student.rollNo}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-bold border-white/10 bg-background/30 shadow-sm">{student.branch}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-primary">
                                        {student.cgpa}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 backdrop-blur-sm bg-background/30 px-2 py-0.5 rounded-full shadow-sm w-max mx-auto border border-white/5">
                                            <span className={student.historyOfArrears > 0 ? "text-orange-500 font-bold" : "text-muted-foreground font-semibold"}>
                                                {student.historyOfArrears}
                                            </span>
                                            <span className="text-muted-foreground/40 text-xs">/</span>
                                            <span className={student.currentArrears > 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                                {student.currentArrears}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {student.skills.slice(0, 2).map(skill => (
                                                <Badge key={skill} variant="secondary" className="text-[10px] h-5 bg-background/50 border-white/10 shadow-sm">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {student.skills.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold shrink-0">
                                                    +{student.skills.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={`text-xs font-bold inline-flex items-center justify-center px-2 py-1 rounded-full border shadow-sm ${student.placementStatus === "Placed" ? "bg-green-500/20 text-green-600 border-green-500/30" :
                                                student.placementStatus === "Unplaced" ? "bg-red-500/20 text-red-600 border-red-500/30" :
                                                    "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                            }`}>
                                            {student.placementStatus}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
