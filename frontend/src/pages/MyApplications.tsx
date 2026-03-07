import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

// Mock Data
interface Application {
    id: string;
    companyName: string;
    visitDate: Date;
    roundsCleared: string;
    packageOffered: number;
    status: "Selected" | "Rejected" | "In Process";
    feedback?: string;
    interviewers?: string[];
    roundsDetails?: { name: string; status: "Cleared" | "Failed" | "Pending" }[];
}

const applicationsData: Application[] = [
    {
        id: "app-1",
        companyName: "TechCorp",
        visitDate: new Date(2024, 1, 10), // Feb 10, 2024
        roundsCleared: "3/4 Rounds Cleared",
        packageOffered: 12,
        status: "In Process",
        feedback: "Strong technical skills, needs improvement in system design.",
        interviewers: ["Sarah Connor", "Kyle Reese"],
        roundsDetails: [
            { name: "Aptitude", status: "Cleared" },
            { name: "Coding", status: "Cleared" },
            { name: "System Design", status: "Pending" },
            { name: "HR", status: "Pending" },
        ],
    },
    {
        id: "app-2",
        companyName: "Innovate Solutions",
        visitDate: new Date(2024, 0, 15), // Jan 15, 2024
        roundsCleared: "4/4 Rounds Cleared",
        packageOffered: 18,
        status: "Selected",
        feedback: "Excellent problem-solving abilities. Cultural fit is perfect.",
        interviewers: ["Tony Stark", "Bruce Banner"],
        roundsDetails: [
            { name: "Online Test", status: "Cleared" },
            { name: "Technical 1", status: "Cleared" },
            { name: "Technical 2", status: "Cleared" },
            { name: "HR", status: "Cleared" },
        ],
    },
    {
        id: "app-3",
        companyName: "WebSystems",
        visitDate: new Date(2023, 11, 5), // Dec 5, 2023
        roundsCleared: "1/3 Rounds Cleared",
        packageOffered: 6.5,
        status: "Rejected",
        feedback: "Good basics but struggled with advanced React concepts.",
        interviewers: ["Peter Parker"],
        roundsDetails: [
            { name: "Aptitude", status: "Cleared" },
            { name: "Technical", status: "Failed" },
            { name: "HR", status: "Pending" },
        ],
    },
    {
        id: "app-4",
        companyName: "CloudNet",
        visitDate: new Date(2024, 1, 28),
        roundsCleared: "0/3 Rounds Cleared",
        packageOffered: 9,
        status: "In Process",
        feedback: "Application submitted.",
        interviewers: [],
        roundsDetails: [
            { name: "Resume Shortlisting", status: "Pending" }
        ]
    }
];

export default function MyApplications() {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [packageRange, setPackageRange] = useState([0]); // 0 to 50

    // Filtering Logic
    const filteredApplications = applicationsData.filter((app) => {
        // Search Filter
        const matchesSearch = app.companyName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        // Date Range Filter
        const matchesDate = dateRange?.from && dateRange?.to
            ? app.visitDate >= dateRange.from && app.visitDate <= dateRange.to
            : true; // If no date selected, show all

        // Package Filter (Show apps with package >= selected value)
        const matchesPackage = app.packageOffered >= packageRange[0];

        return matchesSearch && matchesDate && matchesPackage;
    });

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">My Applications</h1>
                <p className="text-muted-foreground">
                    View and manage your job applications, track status, and review feedback.
                </p>
            </div>

            {/* Global Filters */}
            <Card className="bg-card/50 backdrop-blur-sm sticky top-0 z-10 border-b shadow-sm">
                <CardHeader className="pb-3 pt-4 px-6">
                    <CardTitle className="text-base font-medium">Filters</CardTitle>
                </CardHeader>
                <div className="flex flex-col md:flex-row gap-4 p-4 pt-0">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by company..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Date Range Picker */}
                    <div className="flex-none">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a verified date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Package Slider */}
                    <div className="flex-1 md:max-w-[300px] flex items-center gap-4 border rounded-md px-4 py-2 bg-background">
                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">Min Package: <span className="text-foreground font-semibold">{packageRange[0]} LPA</span></span>
                        <Slider
                            value={packageRange}
                            onValueChange={setPackageRange}
                            max={50}
                            step={1}
                            className="flex-1"
                        />
                    </div>
                </div>
            </Card>

            {/* Accordion List */}
            <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                            <AccordionItem
                                key={app.id}
                                value={app.id}
                                className="border rounded-lg bg-card px-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 pr-4">
                                        {/* Basic Info */}
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-lg font-bold text-primary">{app.companyName}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Visited: {format(app.visitDate, "MMM dd, yyyy")}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 md:gap-8 text-sm">
                                            <div className="flex flex-col items-start md:items-end">
                                                <span className="text-muted-foreground text-xs">Status</span>
                                                <Badge variant={app.status === "Selected" ? "default" : app.status === "Rejected" ? "destructive" : "secondary"}>
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col items-start md:items-end">
                                                <span className="text-muted-foreground text-xs">Performance</span>
                                                <span className="font-medium">{app.roundsCleared}</span>
                                            </div>
                                            <div className="flex flex-col items-start md:items-end min-w-[80px]">
                                                <span className="text-muted-foreground text-xs">Offered</span>
                                                <span className="font-bold text-green-600">{app.packageOffered} LPA</span>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4 border-t mt-2">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Left: Feedback & Details */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold mb-1">Feedback</h4>
                                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                                    {app.feedback || "No feedback provided yet."}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2">Round Details</h4>
                                                <div className="space-y-2">
                                                    {app.roundsDetails?.map((round, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
                                                            <span>{round.name}</span>
                                                            <Badge variant="outline" className={cn(
                                                                "text-xs font-normal",
                                                                round.status === "Cleared" ? "border-green-500 text-green-600 bg-green-50" :
                                                                    round.status === "Failed" ? "border-red-500 text-red-600 bg-red-50" : "border-yellow-500 text-yellow-600 bg-yellow-50"
                                                            )}>{round.status}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Interviewers */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Interview Panel</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {app.interviewers && app.interviewers.length > 0 ? (
                                                    app.interviewers.map((name, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                {name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="text-sm">{name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">Not assigned yet</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No applications found matching your criteria.
                        </div>
                    )}
                </Accordion>
            </div>
        </div>
    );
}
