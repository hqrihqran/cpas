import { useState } from "react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Briefcase, MapPin, IndianRupee, BookOpen, ChevronDown } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Company {
    id: number;
    name: string;
    role: string;
    salary: string;
    location: string;
    requiredCGPA: number;
    requiredSkills: string[];
    description: string;
    responsibilities: string[];
    ctcBreakdown: { label: string; amount: string }[];
}

// Mock Data
const companies: Company[] = [
    {
        id: 1,
        name: "InnovateTech",
        role: "Frontend Developer",
        salary: "12 - 15 LPA",
        location: "Bangalore",
        requiredCGPA: 7.0,
        requiredSkills: ["React", "TypeScript", "Redux"],
        description: "InnovateTech provides cutting-edge digital solutions for global enterprises. We are looking for passionate frontend developers to join our fast-paced team.",
        responsibilities: [
            "Develop user interfaces using React.js",
            "Optimize application for maximum speed and scalability",
            "Collaborate with backend developers and designers"
        ],
        ctcBreakdown: [
            { label: "Base Salary", amount: "10 LPA" },
            { label: "Performance Bonus", amount: "2 LPA" },
            { label: "Joining Bonus", amount: "1 LPA" },
            { label: "Stock Options", amount: "2 LPA" }
        ]
    },
    {
        id: 2,
        name: "DataStreams",
        role: "Data Analyst",
        salary: "8 - 10 LPA",
        location: "Pune",
        requiredCGPA: 7.5,
        requiredSkills: ["Python", "SQL", "Tableau"],
        description: "DataStreams is a big data analytics firm helping businesses make data-driven decisions.",
        responsibilities: [
            "Interpret data, analyze results using statistical techniques",
            "Develop and implement data analyses, data collection systems",
            "Acquire data from primary or secondary data sources"
        ],
        ctcBreakdown: [
            { label: "Base Salary", amount: "7 LPA" },
            { label: "Variable Pay", amount: "2 LPA" },
            { label: "Benefits", amount: "1 LPA" }
        ]
    },
    {
        id: 3,
        name: "CyberSafe",
        role: "Security Analyst",
        salary: "10 - 12 LPA",
        location: "Hyderabad",
        requiredCGPA: 8.5,
        requiredSkills: ["Network Security", "Python", "Linux"],
        description: "CyberSafe is a leader in cybersecurity solutions, protecting organizations from digital threats.",
        responsibilities: [
            "Monitor computer networks for security issues",
            "Investigate security breaches and other cybersecurity incidents",
            "Install security measures and operate software"
        ],
        ctcBreakdown: [
            { label: "Fixed Component", amount: "9 LPA" },
            { label: "Retention Bonus", amount: "3 LPA" }
        ]
    },
    {
        id: 4,
        name: "CloudScale",
        role: "DevOps Engineer",
        salary: "14 - 18 LPA",
        location: "Remote",
        requiredCGPA: 7.0,
        requiredSkills: ["AWS", "Docker", "Kubernetes"],
        description: "CloudScale specializes in cloud infrastructure and DevOps automation.",
        responsibilities: [
            "Build and maintain tools for deployment",
            "Monitor and troubleshoot server issues",
            "collaborate with developers to improve build pipelines"
        ],
        ctcBreakdown: [
            { label: "Base", amount: "12 LPA" },
            { label: "Remote Allowance", amount: "2 LPA" },
            { label: "Stocks", amount: "4 LPA" }
        ]
    },
];
export function EligibilitySection() {
    const [availableCompanies, setAvailableCompanies] = useState(companies);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const handleRejectClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setRejectId(id);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (rejectId) {
            setAvailableCompanies(prev => prev.filter(c => c.id !== rejectId));
            setRejectId(null);
            setIsRejectDialogOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Eligible Opportunities
                </h2>
                <Badge variant="secondary" className="text-xs">
                    {availableCompanies.length} New
                </Badge>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {availableCompanies.map((company) => (
                            <AccordionItem
                                key={company.id}
                                value={`item-${company.id}`}
                                className="border rounded-xl bg-card shadow-sm px-4 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                            >
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 pr-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">{company.role}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Briefcase className="w-3 h-3" />
                                                <span className="font-medium">{company.name}</span>
                                                <span className="mx-1">•</span>
                                                <MapPin className="w-3 h-3" />
                                                <span>{company.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <div className="flex items-center justify-end gap-1 text-primary font-bold">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {company.salary}
                                                </div>
                                                <div className="text-xs text-muted-foreground">GPA &gt; {company.requiredCGPA}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                {company.requiredSkills.slice(0, 2).map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="hidden sm:inline-flex text-[10px] h-6">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {company.requiredSkills.length > 2 && (
                                                    <Badge variant="outline" className="hidden sm:inline-flex text-[10px] h-6">
                                                        +{company.requiredSkills.length - 2}
                                                    </Badge>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1">
                                    <div className="grid md:grid-cols-3 gap-6 border-t pt-4 mt-2">
                                        <div className="md:col-span-2 space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm text-foreground/80">Company Summary</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {company.description}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm text-foreground/80">Key Responsibilities</h4>
                                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                    {company.responsibilities.map((resp, idx) => (
                                                        <li key={idx}>{resp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2 text-sm text-foreground/80">Prerequisites</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {company.requiredSkills.map(skill => (
                                                        <Badge key={skill} variant="outline" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-lg space-y-4 h-fit">
                                            <div>
                                                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                                    CTC Breakdown
                                                </h4>
                                                <div className="space-y-2">
                                                    {company.ctcBreakdown.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">{item.label}</span>
                                                            <span className="font-medium text-foreground">{item.amount}</span>
                                                        </div>
                                                    ))}
                                                    <div className="h-px bg-border my-2" />
                                                    <div className="flex justify-between text-sm font-bold">
                                                        <span>Total CTC</span>
                                                        <span className="text-primary">{company.salary}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4">
                                                 <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="flex-1">Apply Now</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Submit Application</DialogTitle>
                                                            <DialogDescription>
                                                                Applying for <span className="font-medium text-foreground">{company.role}</span> at <span className="font-medium text-foreground">{company.name}</span>.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="name">Full Name</Label>
                                                                <Input id="name" value="Hariharan A" disabled className="bg-muted" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="rollNo">Roll No</Label>
                                                                    <Input id="rollNo" value="7376232CB120" disabled className="bg-muted" />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="cgpa">Current CGPA</Label>
                                                                    <Input id="cgpa" value="7.8" disabled className="bg-muted" />
                                                                </div>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="resume">Resume (PDF)</Label>
                                                                <Input id="resume" type="file" accept=".pdf" />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="submit" onClick={() => alert("Application Submitted Successfully!")}>Confirm Application</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>   
                                                
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 hover:bg-red-600 bg-red-50 text-red-600 border border-red-200 hover:text-white"
                                                    onClick={(e) => handleRejectClick(e, company.id)}
                                                >
                                                    Reject
                                                </Button>

                                               
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Opportunity?</DialogTitle>
                        <DialogDescription>
                            If you reject this you can't apply again, are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="secondary" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmReject}>I'm Sure</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
