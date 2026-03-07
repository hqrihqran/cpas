import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";

interface KPICardsProps {
    totalPlaced: number;
    averageCTC: number;
    placementPercentage: number;
}

export function KPICards({ totalPlaced, averageCTC, placementPercentage }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students Placed</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPlaced}</div>
                    <p className="text-xs text-muted-foreground">Successful placements this season</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average CTC</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{averageCTC.toFixed(2)} LPA</div>
                    <p className="text-xs text-muted-foreground">Average package offered</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Placement %</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{placementPercentage.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Of total eligible students</p>
                </CardContent>
            </Card>
        </div>
    );
}
