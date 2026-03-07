import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Database, Lock, AlertCircle } from "lucide-react";

export function AdminView() {
    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-6rem)] overflow-y-auto pb-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
               
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Import Section */}
                <Card className="glass-panel border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Bulk Data Import
                        </CardTitle>
                        <CardDescription>Upload Excel/CSV files to update records</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/10 transition-colors cursor-pointer group">
                            <div className="p-4 bg-background rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="font-semibold text-lg">Drag & Drop files here</h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">or click to browse from computer</p>
                            <Button size="sm">Select Files</Button>
                        </div>

                        <div className="space-y-2">
                            <h5 className="text-sm font-semibold">Supported Templates</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="justify-start gap-2 h-auto py-2">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="flex flex-col items-start">
                                        <span>Student_Master.xlsx</span>
                                        <span className="text-[10px] text-muted-foreground">v2.4</span>
                                    </div>
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start gap-2 h-auto py-2">
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    <div className="flex flex-col items-start">
                                        <span>Results_Import.csv</span>
                                        <span className="text-[10px] text-muted-foreground">Latest</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Credentials */}
                <Card className="glass-panel border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-orange-500" />
                            Access Control
                        </CardTitle>
                        <CardDescription>Manage user roles and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                                <div>
                                    <p className="font-medium">Faculty Access</p>
                                    <p className="text-xs text-muted-foreground">Last updated: 2 hours ago</p>
                                </div>
                                <Button variant="secondary" size="sm">Manage</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                                <div>
                                    <p className="font-medium">Student Portals</p>
                                    <p className="text-xs text-muted-foreground">All active</p>
                                </div>
                                <Button variant="secondary" size="sm">Settings</Button>
                            </div>

                            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg flex gap-3 text-orange-800 dark:text-orange-300">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold">Security Alert</p>
                                    <p className="mt-1 opacity-90">3 failed login attempts detected from IP 192.168.1.10 today.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
