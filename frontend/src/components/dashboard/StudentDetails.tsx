import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Student } from "@/data/mockData";
import { StudentRadarChart } from "./StudentRadarChart";
import { Briefcase, Calendar, GraduationCap, Building2, TrendingUp } from "lucide-react";

interface StudentDetailsProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentDetails({ student, open, onOpenChange }: StudentDetailsProps) {
    if (!student) return null;

    const placementHistory = [
        {
            company: student.company || "TBD",
            role: "Software Engineer Trainee",
            date: student.eventDate || "2024-01-15",
            status: student.placementStatus === "Placed" ? "Offer Accepted" : "Applied",
            ctc: student.ctc,
        },
        {
            company: student.internship?.split(" ")[0] || "Previous Intern",
            role: "SDE Intern",
            date: "2023-05-20",
            status: "Completed",
        },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                <SheetHeader className="space-y-4">
                    <div>
                        <SheetTitle className="text-2xl font-bold">{student.name}</SheetTitle>
                        <SheetDescription className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-foreground">{student.rollNo}</span>
                            <span>•</span>
                            <span>{student.branch}</span>
                            <span>•</span>
                            <span>{student.batch} Batch</span>
                        </SheetDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant={student.placementStatus === "Placed" ? "default" : student.placementStatus === "Unplaced" ? "destructive" : "secondary"}>
                            {student.placementStatus}
                        </Badge>
                        {student.company && <Badge variant="outline" className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {student.company}</Badge>}
                        {student.ctc && <Badge variant="outline" className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ₹{student.ctc} LPA</Badge>}
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Radar Chart */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Skill Distribution
                        </h4>
                        <StudentRadarChart skills={student.skills} />
                    </div>

                    {/* Academic Summary */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Academic Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg">
                            <div>
                                <span className="text-muted-foreground">CGPA</span>
                                <p className="font-medium text-lg">{student.cgpa}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Internship</span>
                                <p className="font-medium truncate" title={student.internship}>{student.internship || "None"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">History of Arrears</span>
                                <p className="font-medium">{student.historyOfArrears}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Current Arrears</span>
                                <p className={`font-medium ${student.currentArrears > 0 ? "text-red-600" : "text-green-600"}`}>{student.currentArrears}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground block mb-1">Top Skills</span>
                                <div className="flex flex-wrap gap-1">
                                    {student.skills.map(s => (
                                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Placement History Timeline */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Application History
                        </h4>
                        <div className="relative border-l border-muted ml-2 space-y-6 pb-2">
                            {placementHistory.map((item, index) => (
                                <div key={index} className="ml-6 relative">
                                    <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-sm">{item.company}</span>
                                            <span className="text-xs text-muted-foreground">{item.date}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.role}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                                {item.status}
                                            </span>
                                            {item.ctc && <span className="text-xs text-muted-foreground">₹{item.ctc} LPA</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
