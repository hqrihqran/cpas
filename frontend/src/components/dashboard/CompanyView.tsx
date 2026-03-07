import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyView() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center animate-fade-in text-center p-6">
            <div className="max-w-md w-full space-y-6">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                    <Building2 className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Company Portal</h1>
            

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Card className="hover:border-primary/50 cursor-pointer transition-all hover:bg-accent/50">
                        <CardContent className="p-6 flex flex-col items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" />
                            <span className="font-semibold">Post New Job</span>
                        </CardContent>
                    </Card>
                    <Card className="hover:border-primary/50 cursor-pointer transition-all hover:bg-accent/50">
                        <CardContent className="p-6 flex flex-col items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            <span className="font-semibold">View Applicants</span>
                        </CardContent>
                    </Card>
                </div>

                <Button className="w-full" size="lg">Go to Recruiter Dashboard</Button>
            </div>
        </div>
    );
}
