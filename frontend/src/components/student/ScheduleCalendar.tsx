import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Event {
    id?: string;
    date: Date;
    title: string;
    type: "interview" | "test" | "deadline" | "task" | "placement" | "other";
    location?: string;
    time?: string;
    logo_url?: string;
}

const initialInterviews: Event[] = [
    {
        id: "mock-1",
        date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
        title: "Google Technical Interview",
        type: "interview",
        location: "Block A, Room 204",
        time: "10:00 AM"
    },
    {
        id: "mock-2",
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        title: "TCS Aptitude Test",
        type: "test",
        location: "Online",
        time: "2:00 PM"
    },
    {
        id: "mock-3",
        date: new Date(), // Today
        title: "Resume Submission Deadline",
        type: "deadline"
    }
];

export function ScheduleCalendar({ tasks = [] }: { tasks?: any[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Map data from external tasks & merge with mock interviews
    const mergedEvents = useMemo(() => {
        const mappedTasks: Event[] = tasks.map((t: any) => {
            // If the backend already sends perfectly formatted events, use them directly:
            if (t.type === "placement" || t.type === "task" || t.type === "deadline") {
                return {
                    id: String(t.id),
                    date: new Date(t.date),
                    title: t.title,
                    type: t.type,
                    color: t.color,
                    logo_url: t.logo_url
                };
            }

            // Fallback for legacy tasks passed in via old fetchTasks:
            const isOverdue = new Date(t.deadline).getTime() < new Date().setHours(0, 0, 0, 0);
            return {
                id: t.id ? String(t.id) : Math.random().toString(),
                date: new Date(t.deadline),
                title: t.title,
                type: isOverdue ? "deadline" : "task"
            };
        });

        return [...initialInterviews, ...mappedTasks];
    }, [tasks]);

    const selectedDateEvents = mergedEvents.filter(
        event => date && event.date.toDateString() === date.toDateString()
    );

    const upcomingEvents = mergedEvents
        .filter(event => event.date.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 3); // Show top 3 upcoming

    const getEventColor = (type: Event["type"]) => {
        switch (type) {
            case "interview": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80";
            case "test": return "bg-purple-100 text-purple-700 hover:bg-purple-100/80";
            case "deadline": return "bg-red-100 text-red-700 hover:bg-red-100/80";
            case "task": return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
            case "placement": return "bg-amber-100 text-amber-700 hover:bg-amber-100/80 font-bold border border-amber-200 shadow-sm";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
        }
    };

    const getDotColor = (type: Event["type"]) => {
        switch (type) {
            case "interview": return "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]";
            case "deadline": return "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]";
            case "test": return "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]";
            case "placement": return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)] ring-2 ring-amber-500/20"; // Glow effect
            case "task":
            case "other":
            default: return "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-background/40 rounded-xl border shadow-sm p-4 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md w-full max-w-[300px]"
                    components={{
                        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                        DayContent: ({ date: dayDate, ...props }) => {
                            const dayEvents = mergedEvents.filter(e => dayDate && e.date.toDateString() === dayDate.toDateString());

                            const mainContent = (
                                <div className="relative flex flex-col items-center justify-center w-full h-full">
                                    <span>{dayDate.getDate()}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="absolute bottom-[2px] flex gap-[3px] pointer-events-none">
                                            {dayEvents.slice(0, 3).map((e, i) => (
                                                <span
                                                    key={i}
                                                    className={`w-[5px] h-[5px] rounded-full ${getDotColor(e.type)}`}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && <span className="w-[4px] h-[4px] rounded-full bg-muted-foreground" />}
                                        </div>
                                    )}
                                </div>
                            );

                            if (dayEvents.length > 0) {
                                return (
                                    <Tooltip delayDuration={50}>
                                        <TooltipTrigger asChild>
                                            {mainContent}
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            align="center"
                                            className="bg-background/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl z-50 p-2.5 max-w-[220px]"
                                            sideOffset={8}
                                        >
                                            <div className="flex flex-col gap-2">
                                                {dayEvents.map((e, i) => (
                                                    e.type === "placement" ? (
                                                        <Link to="/pipelined" key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/10 transition-colors border border-amber-500/20 shadow-sm group">
                                                            <div className="flex items-center gap-2">
                                                                {e.logo_url ? (
                                                                    <img src={e.logo_url} className="w-6 h-6 object-contain bg-white rounded-md p-0.5" alt="logo" />
                                                                ) : (
                                                                    <div className="w-6 h-6 flex items-center justify-center bg-amber-500 rounded-md text-white font-bold text-xs shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                                                                        {e.title.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <span className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors">{e.title}</span>
                                                            </div>
                                                            <span className="text-[10px] items-center text-amber-600 font-semibold underline decoration-amber-500/30 underline-offset-2 ml-8">View Skills to Focus →</span>
                                                        </Link>
                                                    ) : (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <span className={`w-2 h-2 mt-[3px] rounded-full shrink-0 ${getDotColor(e.type)}`} />
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-xs text-foreground leading-tight text-wrap">{e.title}</span>
                                                                {e.time && <span className="text-[10px] text-muted-foreground font-medium">{e.time}</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }
                            return mainContent;
                        }
                    }}
                />
            </div>

            <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {date?.toDateString() === new Date().toDateString() ? "Today's Events" :
                        date ? `Events on ${date.toLocaleDateString()}` : "Upcoming Events"}
                </h4>

                <div className="space-y-3">
                    {(date ? selectedDateEvents : upcomingEvents).length > 0 ? (
                        (date ? selectedDateEvents : upcomingEvents).map((event, index) => (
                            <div key={index} className="flex flex-col gap-1 p-3 rounded-lg border bg-card/80 hover:bg-card transition-colors shadow-sm">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm">{event.title}</span>
                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border-0 ${getEventColor(event.type)}`}>
                                        {event.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {event.time && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{event.time}</span>
                                        </div>
                                    )}
                                    {event.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 font-medium">
                                    {event.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed hover:bg-muted/30 transition-colors">
                            No events scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
