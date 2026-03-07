import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryReportProps {
    departmentStats: {
        department: string;
        total: number;
        placed: number;
        avgCTC: number;
    }[];
    topCompanies: { company: string; offers: number }[];
    filters: {
        packageRange: number[];
        skill: string;
        year: string;
    };
}

export function SummaryReport({ departmentStats, topCompanies, filters }: SummaryReportProps) {
    const currentDate = new Date().toLocaleDateString();
    const totalOffers = departmentStats.reduce((acc, curr) => acc + curr.placed, 0);

    return (
        <div className="space-y-8 p-6 border rounded-lg bg-card text-card-foreground shadow-sm animate-in fade-in-50">
            <div className="flex justify-between items-start border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold">Placement Summary Report</h2>
                    <p className="text-sm text-muted-foreground">Generated on {currentDate}</p>
                </div>
                <div className="text-right text-sm">
                    <div className="font-semibold">Filters Applied:</div>
                    <div>Range: {filters.packageRange[0]}-{filters.packageRange[1]} LPA</div>
                    <div>Skill: {filters.skill}</div>
                    <div>Year: {filters.year}</div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dept</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Placed</TableHead>
                                    <TableHead className="text-right">Avg CTC</TableHead>
                                    <TableHead className="text-right">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departmentStats.map((stat) => (
                                    <TableRow key={stat.department}>
                                        <TableCell className="font-medium">{stat.department}</TableCell>
                                        <TableCell className="text-right">{stat.total}</TableCell>
                                        <TableCell className="text-right">{stat.placed}</TableCell>
                                        <TableCell className="text-right">₹{stat.avgCTC.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={(stat.placed / stat.total) * 100 > 80 ? "default" : "secondary"}>
                                                {((stat.placed / stat.total) * 100).toFixed(0)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Top Recruiters (Visible Data)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topCompanies.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="font-medium text-sm">{c.company}</span>
                                        <span className="font-bold text-sm">{c.offers} offers</span>
                                    </div>
                                ))}
                                {topCompanies.length === 0 && <div className="text-muted-foreground text-sm">No data available</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Key Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm opacity-90">
                                A total of <strong>{totalOffers}</strong> successful placements recorded under current selection criteria.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
