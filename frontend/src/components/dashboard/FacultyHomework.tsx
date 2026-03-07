import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, CheckCircle2, Clock, Users } from "lucide-react";
import { addTask, mockHomeworkTasks, HomeworkTask, students } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function FacultyHomework() {
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

    const [tasks, setTasks] = useState<HomeworkTask[]>(mockHomeworkTasks);

    useEffect(() => {
        const handleUpdate = () => setTasks([...mockHomeworkTasks]);
        window.addEventListener("tasksUpdated", handleUpdate);
        return () => window.removeEventListener("tasksUpdated", handleUpdate);
    }, []);

    // Assign to my mentees (mock)
    const mentees = students.slice(0, 4);

    const handleAssign = () => {
        if (!title || !description || !deadline) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all task details.",
                variant: "destructive"
            });
            return;
        }

        const newTask: HomeworkTask = {
            id: `hw-${Date.now()}`,
            title,
            description,
            deadline,
            assignedTo: mentees.map(m => m.id), // automatically assigned to all mentees for demo
            viewedBy: [],
            completedBy: []
        };

        addTask(newTask);
        setTitle("");
        setDescription("");
        setDeadline("");

        toast({
            title: "Task Assigned!",
            description: "Homework has been dispatched to your mentees."
        });
    };

    return (
        <div className="space-y-8 animate-fade-in p-6 lg:p-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Homework Hub
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Compose Task Card (Left) */}
                <Card className="lg:col-span-5 glass-panel border-white/20 shadow-sm rounded-2xl bg-card/40 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Compose Task
                        </CardTitle>
                        <CardDescription>Assign new homework or tasks to your mentees.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Task Title</label>
                            <Input
                                placeholder="e.g. Resume Update"
                                className="bg-background/60 border-white/10"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Description</label>
                            <Textarea
                                placeholder="Describe the task requirements..."
                                className="bg-background/60 border-white/10 min-h-[120px] resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Deadline</label>
                            <Input
                                type="date"
                                className="bg-background/60 border-white/10"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button className="w-full gap-2 font-bold shadow-md shadow-primary/20" onClick={handleAssign}>
                                <Send className="h-4 w-4" /> Dispatch to Mentees ({mentees.length})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sent Tasks Status Tracker (Right) */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Sent Tasks Status
                    </h3>

                    <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {tasks.filter(t => t.assignedTo.length === 0 || t.completedBy.length < t.assignedTo.length).map(task => {
                            const completionRate = task.assignedTo.length
                                ? Math.round((task.completedBy.length / task.assignedTo.length) * 100)
                                : 0;
                            const isExpanded = expandedTaskId === task.id;

                            return (
                                <Card
                                    key={task.id}
                                    className="glass-panel border-white/20 shadow-sm rounded-2xl bg-card/40 backdrop-blur-md hover:shadow-md transition-all cursor-pointer overflow-hidden"
                                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg text-foreground">{task.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-background/50 border-white/20 whitespace-nowrap">
                                                Due: {task.deadline}
                                            </Badge>
                                        </div>

                                        {/* Status Metrics */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5" /> Assigned
                                                </div>
                                                <p className="text-lg font-bold">{task.assignedTo.length}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                                                    <Clock className="h-3.5 w-3.5" /> Viewed
                                                </div>
                                                <p className="text-lg font-bold text-foreground">{task.viewedBy.length}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                                                </div>
                                                <p className="text-lg font-bold text-foreground">{task.completedBy.length}</p>
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <span className="text-xs text-right font-medium text-muted-foreground mb-1">
                                                    {completionRate}% Done
                                                </span>
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Detailed List */}
                                        {isExpanded && (
                                            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                                <div className="space-y-3">
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-green-500 flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Completed by ({task.completedBy.length})
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {task.completedBy.length > 0 ? task.completedBy.map(id => {
                                                            const student = students.find(s => s.id === id);
                                                            return (
                                                                <div key={id} className="text-sm border border-green-500/20 bg-green-500/10 rounded-lg p-2 flex justify-between items-center">
                                                                    <span className="font-medium">{student?.name || `Student ${id}`}</span>
                                                                    <span className="text-xs text-muted-foreground">{student?.rollNo}</span>
                                                                </div>
                                                            );
                                                        }) : (
                                                            <p className="text-xs text-muted-foreground italic">None yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Pending ({task.assignedTo.length - task.completedBy.length})
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {task.assignedTo.filter(id => !task.completedBy.includes(id)).length > 0 ? task.assignedTo.filter(id => !task.completedBy.includes(id)).map(id => {
                                                            const student = students.find(s => s.id === id);
                                                            return (
                                                                <div key={id} className="text-sm border border-white/10 bg-background/40 rounded-lg p-2 flex justify-between items-center">
                                                                    <span className="font-medium text-foreground">{student?.name || `Student ${id}`}</span>
                                                                    <span className="text-xs text-muted-foreground">{student?.rollNo}</span>
                                                                </div>
                                                            );
                                                        }) : (
                                                            <p className="text-xs text-muted-foreground italic">None pending</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {tasks.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl">
                                No tasks assigned yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
