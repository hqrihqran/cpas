import { useState, useEffect } from "react";
import { EligibilitySection } from "@/components/student/EligibilitySection";
import { ScheduleCalendar } from "@/components/student/ScheduleCalendar";
import { ActiveProcessTracker } from "@/components/student/ActiveProcessTracker";
import { PersonalPerformanceOverview } from "@/components/student/PersonalPerformanceOverview";
import { StudentRadarChart } from "./StudentRadarChart";
import { mockHomeworkTasks, completeTask } from "@/data/mockData";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import confetti from "canvas-confetti";

export function StudentView() {
    const studentSkills = ["Coding", "Aptitude", "Communication", "Technical", "Design"];

    // Using mock user ID "1" for demonstration
    const [tasks, setTasks] = useState(mockHomeworkTasks.filter(t => t.assignedTo.includes("1")));
    const [animatingId, setAnimatingId] = useState<string | null>(null);

    useEffect(() => {
        const handleUpdate = () => setTasks(mockHomeworkTasks.filter(t => t.assignedTo.includes("1")));
        window.addEventListener("tasksUpdated", handleUpdate);
        return () => window.removeEventListener("tasksUpdated", handleUpdate);
    }, []);

    const handleMarkDone = (taskId: string, e: React.MouseEvent) => {
        // Trigger confetti from the button's position
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 80,
            spread: 60,
            origin: { x, y },
            colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
        });

        setAnimatingId(taskId);
        setTimeout(() => {
            completeTask(taskId, "1");
            setAnimatingId(null);
        }, 1000);
    };

    const visibleTasks = tasks.filter(task => !task.completedBy.includes("1") || animatingId === task.id);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in p-6 lg:p-8 items-start">
            {/* Main Content Area (Center) - Spans 9 cols */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                {/* Greeting */}
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 w-fit">
                        <br></br>Hi, Hariharan A
                    </h1>

                </div>

                {/* Performance & Skills Bento Box */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Performance Trend */}
                    <div className="glass-panel p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md min-h-[350px] flex flex-col">
                        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Performance Trend
                        </h3>
                        <div className="flex-1 w-full min-h-[250px]">
                            <PersonalPerformanceOverview />
                        </div>
                    </div>

                    {/* Skill Proficiency Radar */}
                    <div className="glass-panel p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md min-h-[350px] flex flex-col">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Skill Proficiency
                        </h3>
                        <div className="flex-1 min-h-[250px] flex items-center justify-center">
                            <StudentRadarChart skills={studentSkills} />
                        </div>
                    </div>
                </div>

                {/* Tasks from Mentor */}
                <div className="w-full">
                    <div className="glass-panel rounded-2xl border border-white/20 bg-card/40 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all">
                        <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Tasks from Mentor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visibleTasks.length > 0 ? visibleTasks.map(task => {
                                const isCompleted = task.completedBy.includes("1") || animatingId === task.id;
                                const isAnimating = animatingId === task.id;

                                return (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "bg-background/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-all duration-700",
                                            isAnimating ? "opacity-0 scale-95" : "opacity-100 hover:-translate-y-1 scale-100"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-foreground text-md leading-tight">{task.title}</h4>
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 transform scale-110 transition-transform duration-300" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                                        <div className="mt-auto pt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-500">
                                                <Clock className="h-3.5 w-3.5" /> Due {task.deadline}
                                            </div>
                                            {!isCompleted && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white cursor-pointer transition-colors"
                                                    onClick={(e) => handleMarkDone(task.id, e)}
                                                >
                                                    Mark Done
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-muted-foreground text-sm">No tasks assigned currently.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Eligible Opportunities Section */}
                <div className="w-full">
                    <div className="rounded-2xl border bg-card/30 p-6 shadow-sm">
                        <EligibilitySection />
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Tracking & Schedule - Spans 3 cols */}
            <div className="lg:col-span-4 flex flex-col gap-8 pl-4 sticky top-16 bottom-20">
                {/* Status Tracker */}
                <div className="glass-panel max-w-sm p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        Application Status
                    </h3>
                    <ActiveProcessTracker />
                </div>

                {/* Schedule */}
                <div className="glass-panel p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm flex-1 transition-all hover:shadow-md">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        Upcoming Schedule
                    </h3>
                    <ScheduleCalendar />
                </div>
            </div>
        </div>
    );
}
