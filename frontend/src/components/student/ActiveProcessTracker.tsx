import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
    id: number;
    name: string;
    status: "completed" | "current" | "upcoming";
    date?: string;
}

const activeProcess = {
    company: "Google",
    role: "Software Engineer Intern",
    stages: [
        { id: 1, name: "Applied", status: "completed", date: "Feb 10" },
        { id: 2, name: "Aptitude Test", status: "completed", date: "Feb 12" },
        { id: 3, name: "Technical Interview", status: "current", date: "Feb 15 (Today)" },
        { id: 4, name: "HR Round", status: "upcoming" },
        { id: 5, name: "Offer", status: "upcoming" },
    ] as Stage[],
};

export function ActiveProcessTracker() {
    return (
        <div className="w-full relative pl-2 pt-2 pb-0">
            {/* Vertical Line */}
            <div className="absolute top-[18px] left-[19px] h-[calc(100%-40px)] w-[2px] bg-muted" />

            <div className="flex flex-col gap-6">
                {activeProcess.stages.map((stage, index) => (
                    <div key={stage.id} className="flex gap-4 items-start relative z-10">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors shrink-0",
                            stage.status === "completed" ? "border-primary bg-primary text-primary-foreground" :
                                stage.status === "current" ? "border-primary text-primary ring-4 ring-primary/20" :
                                    "border-muted text-muted-foreground"
                        )}>
                            {stage.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : stage.status === "current" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Circle className="w-3 h-3" />
                            )}
                        </div>
                        <div className="flex flex-col pt-0.5">
                            <p className={cn(
                                "text-sm font-semibold leading-none",
                                stage.status === "current" ? "text-primary" :
                                    stage.status === "completed" ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {stage.name}
                            </p>
                            {stage.date && (
                                <p className="text-xs text-muted-foreground mt-1 font-medium">{stage.date}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
