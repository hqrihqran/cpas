import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { students } from "@/data/mockData";
import { Briefcase, Building, ChevronDown, ChevronUp, Loader2, Award, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// API calls go through the Vite proxy → Flask at localhost:5000
const API_BASE = "";

interface StudentDetails {
    student: {
        id: number; name: string; roll_no: string; branch: string;
        cgpa: string; history_of_arrears: number; current_arrears: number; placement_status: string;
    };
    skills: { subject: string; A: number; fullMark: number }[];
    history: { id: number; company_name: string; status: string; date: string; package: string; rounds: string[] }[];
}

export function FacultyMe() {
    const { tokens } = useAuth();
    const { toast } = useToast();

    // Mock mentees for this faculty 
    const mentees = students.slice(0, 4);

    const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
    const [detailsData, setDetailsData] = useState<Record<string, StudentDetails>>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    const fetchStudentDetails = async (id: string) => {
        if (activeStudentId === id) {
            setActiveStudentId(null); // Close if already open
            return;
        }

        setActiveStudentId(id);

        // Don't re-fetch if we already have it
        if (detailsData[id]) return;

        setIsLoading(prev => ({ ...prev, [id]: true }));
        try {
            console.log(`[FacultyMe] Fetching details for studentId: ${id}`);

            // User specified headers requirement: headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            // Using logic to try that key first, fallback to context tokens if missing
            const rawToken = localStorage.getItem('token');
            const token = rawToken ? rawToken : tokens?.access_token;

            const res = await fetch(`/api/mentor/mentee-details/${id}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`[FacultyMe] Success response for ${id}:`, data);
                setDetailsData(prev => ({ ...prev, [id]: data }));
            } else {
                const errData = await res.text();
                console.log(`[FacultyMe] Failed with status: ${res.status}. Body: ${errData}`);
                toast({ title: "Failed to fetch student profile", variant: "destructive" });
            }
        } catch (error) {
            console.error(`[FacultyMe] Network Error for ${id}:`, error);
            toast({ title: "Network Error", variant: "destructive" });
        } finally {
            setIsLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 lg:p-8 pt-0 lg:pt-0">
            <h1 className="text-3xl font-extrabold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Mentor Profile
            </h1>

            {/* Profile Section */}
            <Card className="glass-panel border-white/20 shadow-sm rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mentees.map((mentee) => {
                        const isExpanded = activeStudentId === mentee.id;
                        const menteeDetails = detailsData[mentee.id];
                        const loading = isLoading[mentee.id];

                        return (
                            <Card
                                key={mentee.id}
                                className={`glass-panel border-white/20 shadow-sm rounded-2xl bg-card/40 backdrop-blur-md transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/50 shadow-md md:col-span-2' : 'hover:shadow-md hover:-translate-y-1 cursor-pointer'}`}
                            >
                                <CardContent
                                    className="p-6 flex flex-col gap-4 cursor-pointer"
                                    onClick={() => fetchStudentDetails(mentee.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg group-hover:text-primary transition-colors">{mentee.name}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{mentee.rollNo} • {mentee.branch}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="font-bold text-primary bg-primary/10 border-primary/20">
                                                {mentee.cgpa}
                                            </Badge>
                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-muted-foreground">Placement Status</span>
                                            <span className={mentee.placementStatus === "Placed" ? "text-green-500" : mentee.placementStatus === "Unplaced" ? "text-red-500" : "text-yellow-600"}>
                                                {mentee.placementStatus}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${mentee.placementStatus === "Placed" ? "w-full bg-green-500" :
                                                mentee.placementStatus === "In Process" ? "w-1/2 bg-yellow-500" : "w-[5%] bg-red-400"}`} />
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Expanded Content Area */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-4 duration-300 edge-fade border-t border-border/50 mt-2">
                                        {loading ? (
                                            <div className="flex justify-center items-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : menteeDetails ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">

                                                {/* Left Column: Academics & Chart */}
                                                <div className="space-y-6 lg:col-span-1">
                                                    <Card className="bg-background/40 border-border/50 shadow-none">
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Academics</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Current CGPA</span>
                                                                <span className="font-bold">{menteeDetails.student.cgpa}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Current Arrears</span>
                                                                <span className={`font-bold ${menteeDetails.student.current_arrears > 0 ? 'text-destructive' : 'text-green-500'}`}>{menteeDetails.student.current_arrears}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">History of Arrears</span>
                                                                <span className="font-bold">{menteeDetails.student.history_of_arrears}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-background/40 border-border/50 shadow-none">
                                                        <CardHeader className="pb-0">
                                                            <CardTitle className="text-sm font-semibold">Skill Radar</CardTitle>
                                                            <CardDescription className="text-xs">Proficiency % from Master DB</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="h-[220px] flex items-center justify-center -ml-4">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={menteeDetails.skills}>
                                                                    <PolarGrid stroke="#888888" strokeOpacity={0.2} />
                                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#888888", fontSize: 10 }} />
                                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                                    <Radar name="Student" dataKey="proficiency_percentage" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                                                                </RadarChart>
                                                            </ResponsiveContainer>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Right Column: Applications History */}
                                                <div className="lg:col-span-2 space-y-4">
                                                    <h4 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">Placement History</h4>

                                                    {menteeDetails.history.length === 0 ? (
                                                        <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground">
                                                            <p className="text-sm">No placement applications found.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                                            {menteeDetails.history.map((app) => (
                                                                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/40 hover:bg-muted/20 transition-colors">
                                                                    {/* Status dot */}
                                                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${app.status === "Selected" ? "bg-green-500" :
                                                                        app.status === "Rejected" ? "bg-red-500" : "bg-yellow-400"
                                                                        }`} />

                                                                    {/* Main info */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                            <span className="font-semibold text-sm truncate">{app.company_name}</span>
                                                                            {app.status === "Selected" ? (
                                                                                <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 shrink-0">Placed ✓</Badge>
                                                                            ) : app.status === "Rejected" ? (
                                                                                <Badge variant="destructive" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20 shadow-none shrink-0">Rejected</Badge>
                                                                            ) : (
                                                                                <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-400/30 shrink-0">In Process</Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{app.date}</span>
                                                                            <span className="flex items-center gap-1"><Award className="w-3 h-3" />{app.package}</span>
                                                                            {(app as any).rounds_cleared > 0 && (
                                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                                                                                    {(app as any).rounds_cleared} round{(app as any).rounds_cleared > 1 ? 's' : ''} cleared
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-muted-foreground">Failed to load data.</div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
