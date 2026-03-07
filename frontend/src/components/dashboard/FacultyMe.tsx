import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { students } from "@/data/mockData";
import { Briefcase, Building } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StudentView } from "./StudentView";

export function FacultyMe() {
    // Mock mentees for this faculty
    const mentees = students.slice(0, 4);

    return (
        <div className="space-y-6 animate-fade-in p-6 lg:p-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Mentor Profile
            </h1>

            {/* Profile Section */}
            <Card className="glass-panel border-white/20 shadow-sm rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                    {/* Background blob for style */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 border-none"></div>

                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30 shrink-0">
                        Dr. S
                    </div>

                    <div className="flex flex-col gap-2 flex-1 w-full text-center md:text-left text-foreground">
                        <h2 className="text-2xl font-bold">Dr. Sharma</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span>Code: FAC-2024-001</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                <Building className="h-4 w-4 text-primary" />
                                <span>Dept: Computer Science & Eng.</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mentees Insight */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Mentees Insight
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {mentees.map(mentee => (
                        <Dialog key={mentee.id}>
                            <DialogTrigger asChild>
                                <Card className="glass-panel border-white/20 shadow-sm rounded-2xl bg-card/40 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-1 group cursor-pointer">
                                    <CardContent className="p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg group-hover:text-primary transition-colors">{mentee.name}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{mentee.rollNo} • {mentee.branch}</span>
                                            </div>
                                            <Badge variant="outline" className="font-bold text-primary bg-primary/10 border-primary/20">
                                                {mentee.cgpa}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted-foreground">Placement Status</span>
                                                <span className={mentee.placementStatus === "Placed" ? "text-green-500" : mentee.placementStatus === "Unplaced" ? "text-red-500" : "text-yellow-600"}>
                                                    {mentee.placementStatus}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                                {/* Miniature placement status slider */}
                                                <div className={`h-full rounded-full transition-all duration-1000 ${mentee.placementStatus === "Placed" ? "w-full bg-green-500" :
                                                    mentee.placementStatus === "In Process" ? "w-1/2 bg-yellow-500" : "w-[5%] bg-red-400"
                                                    }`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto p-0 border-none bg-transparent shadow-none" aria-describedby="student-dashboard">
                                <div className="bg-background rounded-2xl border border-border/50 overflow-hidden h-full shadow-2xl relative shadow-primary/10">
                                    <StudentView />
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            </div>
        </div>
    );
}
