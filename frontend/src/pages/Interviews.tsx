import { CommunityInsights } from "@/components/student/CommunityInsights";

export function Interviews() {
    return (
        <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent w-fit">
                        Interview Experiences
                    </h1>
                    <p className="text-muted-foreground">
                        Learn from the experiences of your peers and seniors.
                    </p>
                </div>

                <CommunityInsights />
            </div>
        </div>
    );
}
