import { CheckCircle2, Clock, XCircle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Application {
    id: number;
    company: string;
    role: string;
    date: string;
    status: "selected" | "rejected" | "pending";
}

const history: Application[] = [
    { id: 1, company: "TechCorp", role: "Senior SDE", date: "2024-02-10", status: "pending" },
    { id: 2, company: "StartUp Inc", role: "Full Stack Engineer", date: "2024-01-25", status: "rejected" },
    { id: 3, company: "Global Systems", role: "System Analyst", date: "2024-01-15", status: "selected" },
    { id: 4, company: "DataFlow", role: "Data Engineer", date: "2023-12-10", status: "rejected" },
];

const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
        case "selected":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "rejected":
            return <XCircle className="h-5 w-5 text-red-500" />;
        case "pending":
            return <Clock className="h-5 w-5 text-yellow-500" />;
    }
};

const getStatusColor = (status: Application["status"]) => {
    switch (status) {
        case "selected":
            return "text-green-600 bg-green-50";
        case "rejected":
            return "text-red-600 bg-red-50";
        case "pending":
            return "text-yellow-600 bg-yellow-50";
    }
};

export function PlacementHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Application History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative space-y-0 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {history.map((item, index) => (
                        <div key={item.id} className="flex gap-4 pb-8 last:pb-0 relative">
                            {index !== history.length - 1 && (
                                <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-border" />
                            )}
                            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                                {getStatusIcon(item.status)}
                            </div>
                            <div className="flex flex-col flex-1 gap-1 pt-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">{item.company}</span>
                                    <span className="text-xs text-muted-foreground">{item.date}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">{item.role}</div>
                                <div className={`mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
