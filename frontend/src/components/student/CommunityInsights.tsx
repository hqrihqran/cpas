import { useState } from "react";
import { Search, MessageSquare, ThumbsUp, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Insight {
    id: number;
    studentName: string;
    company: string;
    role: string;
    date: string;
    type: "Interview" | "Exam" | "General";
    content: string;
    likes: number;
    comments: number;
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const initialInsights: Insight[] = [
    {
        id: 1,
        studentName: "Alex Johnson",
        company: "Google",
        role: "SDE I",
        date: "2 days ago",
        type: "Interview",
        content: "The interview focused heavily on graph algorithms and dynamic programming. 3 rounds of coding and 1 system design. Be prepared for...",
        likes: 45,
        comments: 12,
    },
    {
        id: 2,
        studentName: "Sarah Smith",
        company: "Microsoft",
        role: "Product Manager",
        date: "1 week ago",
        type: "Interview",
        content: "Asked about product design for a vending machine for the blind. Focus on empathy and user constraints. Behavioral questions were standard.",
        likes: 32,
        comments: 8,
    },
    {
        id: 3,
        studentName: "Mike Brown",
        company: "Amazon",
        role: "SDE Intern",
        date: "3 days ago",
        type: "Exam",
        content: "Online assessment had 2 coding questions. One array manipulation and one sliding window. 90 minutes. Test cases were tricky.",
        likes: 28,
        comments: 5,
    },
];

export function CommunityInsights() {
    const [searchTerm, setSearchTerm] = useState("");
    const [insights, setInsights] = useState<Insight[]>(initialInsights);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newInsight, setNewInsight] = useState<{
        company: string;
        role: string;
        type: "Interview" | "Exam" | "General";
        content: string;
    }>({
        company: "",
        role: "",
        type: "Interview",
        content: ""
    });

    const filteredInsights = insights.filter(
        (insight) =>
            insight.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insight.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insight.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleAddInsight = () => {
        if (!newInsight.company || !newInsight.role || !newInsight.content) return;

        const insight: Insight = {
            id: insights.length + 1,
            studentName: "Hariharan A", // Assuming logged-in user
            company: newInsight.company,
            role: newInsight.role,
            date: "Just now",
            type: newInsight.type,
            content: newInsight.content,
            likes: 0,
            comments: 0
        };

        setInsights([insight, ...insights]);
        setIsDialogOpen(false);
        setNewInsight({ company: "", role: "", type: "Interview", content: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Community Insights
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Experience
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Share Your Experience</DialogTitle>
                            <DialogDescription>
                                Help your peers by sharing your interview or exam experience.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        placeholder="e.g. Google"
                                        value={newInsight.company}
                                        onChange={(e) => setNewInsight({ ...newInsight, company: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input
                                        id="role"
                                        placeholder="e.g. SDE I"
                                        value={newInsight.role}
                                        onChange={(e) => setNewInsight({ ...newInsight, role: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={newInsight.type}
                                    onValueChange={(value: "Interview" | "Exam" | "General") =>
                                        setNewInsight({ ...newInsight, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Interview">Interview</SelectItem>
                                        <SelectItem value="Exam">Exam / Assessment</SelectItem>
                                        <SelectItem value="General">General Advice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Experience Details</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Share the questions asked, difficulty level, and your approach..."
                                    className="min-h-[100px]"
                                    value={newInsight.content}
                                    onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddInsight} disabled={!newInsight.company || !newInsight.content}>Post</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by company name..."
                    className="pl-9 bg-background/50 backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredInsights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No insights found. Be the first to share!
                    </div>
                ) : (
                    filteredInsights.map((insight) => {
                        const isExpanded = expandedIds.has(insight.id);
                        return (
                            <Card key={insight.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 bg-muted/20">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-muted">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {insight.studentName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                                    {insight.company}
                                                    <span className="text-muted-foreground font-normal text-sm">for</span>
                                                    {insight.role}
                                                </CardTitle>
                                                <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                                                    <User className="h-3 w-3" />
                                                    {insight.studentName}
                                                    <span className="mx-1">•</span>
                                                    {insight.date}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant={insight.type === "Interview" ? "default" : "secondary"}>
                                            {insight.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className={`text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed transition-all ${isExpanded ? "" : "line-clamp-3"}`}>
                                        {insight.content}
                                    </p>
                                    {!isExpanded && insight.content.length > 150 && (
                                        <button
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-1 transition-colors"
                                            onClick={() => toggleExpand(insight.id)}
                                        >
                                            See more
                                        </button>
                                    )}
                                    {isExpanded && (
                                        <button
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-1 transition-colors"
                                            onClick={() => toggleExpand(insight.id)}
                                        >
                                            Show less
                                        </button>
                                    )}
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors group">
                                            <ThumbsUp className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                            {insight.likes} Helpful
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors group">
                                            <MessageSquare className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                            {insight.comments} Comments
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
