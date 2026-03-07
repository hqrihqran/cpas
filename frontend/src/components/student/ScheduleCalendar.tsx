import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock } from "lucide-react";

interface Event {
    date: Date;
    title: string;
    type: "interview" | "test" | "deadline" | "other";
    location?: string;
    time?: string;
}

const initialEvents: Event[] = [
    {
        date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
        title: "Infosys Technical Interview",
        type: "interview",
        location: "Block A, Room 204",
        time: "10:00 AM"
    },
    {
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        title: "TCS Aptitude Test",
        type: "test",
        location: "Online",
        time: "2:00 PM"
    },
    {
        date: new Date(), // Today
        title: "Resume Submission Deadline",
        type: "deadline"
    }
];

export function ScheduleCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events] = useState<Event[]>(initialEvents);

    const selectedDateEvents = events.filter(
        event => date && event.date.toDateString() === date.toDateString()
    );

    const upcomingEvents = events
        .filter(event => event.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 3); // Show top 3 upcoming

    const getEventColor = (type: Event["type"]) => {
        switch (type) {
            case "interview": return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
            case "test": return "bg-purple-100 text-purple-700 hover:bg-purple-100/80";
            case "deadline": return "bg-red-100 text-red-700 hover:bg-red-100/80";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-background/40 rounded-xl border shadow-sm p-4 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
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
