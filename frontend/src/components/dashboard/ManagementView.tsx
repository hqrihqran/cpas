import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Building2, Briefcase, GraduationCap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { departmentPlacements } from "@/data/mockData";

const offerAcceptanceData = [
    { name: "Accepted", value: 485, color: "hsl(var(--primary))" },
    { name: "Pending", value: 65, color: "hsl(var(--muted))" },
    { name: "Rejected", value: 35, color: "hsl(var(--destructive))" },
];

const registrationTrends = [
    { month: "Aug", registrations: 120, dropouts: 2 },
    { month: "Sep", registrations: 350, dropouts: 5 },
    { month: "Oct", registrations: 580, dropouts: 12 },
    { month: "Nov", registrations: 600, dropouts: 15 },
    { month: "Dec", registrations: 600, dropouts: 18 },
    { month: "Jan", registrations: 600, dropouts: 20 },
];

export function ManagementView() {
    return (
        <div className="space-y-8 animate-fade-in pb-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Position Tracking</h1>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StrategyKPI
                    title="Total Placed"
                    value="485"
                    subtext="81% of eligible students"
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend="+12%"
                    bg="bg-blue-50 dark:bg-blue-900/10"
                />
                <StrategyKPI
                    title="Average CTC"
                    value="₹ 7.2 LPA"
                    subtext="Highest: ₹ 45 LPA"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                    trend="+8.5%"
                    bg="bg-emerald-50 dark:bg-emerald-900/10"
                />
                <StrategyKPI
                    title="Placement %"
                    value="81%"
                    subtext="Goal: 95% by April"
                    icon={<Briefcase className="w-5 h-5 text-violet-600" />}
                    trend="-2%"
                    trendNegative
                    bg="bg-violet-50 dark:bg-violet-900/10"
                />
                <StrategyKPI
                    title="Partner Companies"
                    value="42"
                    subtext="15 New Recruters"
                    icon={<Building2 className="w-5 h-5 text-amber-600" />}
                    trend="+5"
                    bg="bg-amber-50 dark:bg-amber-900/10"
                />
            </div>

            {/* Core Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Offer Acceptance Rate (Pie Chart) */}
                <Card className="glass-panel border-none shadow-sm h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Offer Outcomes</CardTitle>
                        <CardDescription>Acceptance Ratio</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={offerAcceptanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {offerAcceptanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overlay */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 text-center pointer-events-none">
                            <span className="text-3xl font-bold block">83%</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Accepted</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Department Wise Trends (Stacked Bar) */}
                <Card className="glass-panel lg:col-span-2 border-none shadow-sm h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Department Performance</CardTitle>
                        <CardDescription>Placed Students vs Total Strength</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentPlacements} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis
                                    dataKey="department"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar dataKey="placed" name="Placed" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="total" name="Remaining" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recruiter Engagement (List) */}
                <Card className="glass-panel border-none shadow-sm h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Recruiters</CardTitle>
                        <CardDescription>By Volume of Offers</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="space-y-5">
                            {[
                                { name: "Cognizant", count: 120, logo: "C", trend: "+15%" },
                                { name: "TCS", count: 95, logo: "T", trend: "+5%" },
                                { name: "Accenture", count: 85, logo: "A", trend: "-2%" },
                                { name: "Zoho Corp", count: 45, logo: "Z", trend: "+20%" },
                                { name: "Freshworks", count: 30, logo: "F", trend: "+8%" },
                            ].map((company, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shadow-inner">
                                            {company.logo}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{company.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">IT Services</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-sm block">{company.count}</span>
                                        <span className={`text-[10px] font-medium ${company.trend.includes('-') ? 'text-red-500' : 'text-green-500'}`}>{company.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Registration & Dropout Trends (Area Chart) */}
                <Card className="glass-panel lg:col-span-2 border-none shadow-sm h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Participation Trends</CardTitle>
                        <CardDescription>Student Registrations vs Dropouts throughout the season</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={registrationTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDrop" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="registrations" name="Active Students" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReg)" strokeWidth={2} />
                                <Area type="monotone" dataKey="dropouts" name="Dropouts" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorDrop)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

function StrategyKPI({ title, value, subtext, icon, trend, bg, trendNegative }: any) {
    return (
        <Card className="glass-card border-none hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${bg} backdrop-blur-sm bg-opacity-80`}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendNegative ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'}`}>
                            {trendNegative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
                </div>
                {subtext && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium truncate">{subtext}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
