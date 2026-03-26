import { useRole } from "@/contexts/RoleContext";
import StudentDashboard from "./StudentDashboard";
import Analytics from "./Analytics";
import Students from "./Students";
import Companies from "./Companies";

const Index = () => {
    const { role } = useRole();

    // Role-based Content Switching
    switch (role) {
        case "student":
            return <StudentDashboard />;
        case "management":
            return <Analytics />;
        case "faculty":
            return <Students />; // Faculty lands on Students table
        case "company":
            return <Companies />;
        case "admin":
        case "placement_officer":
        default:
            // Keep existing Admin Dashboard content here
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of system performance and placement activities.
                        </p>
                    </div>
                    {/* ... existing overview content or placeholder ... */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Simple placeholders for now if original content was complex or import it differently */}
                        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h3 className="font-semibold">Total Students</h3>
                            <p className="text-2xl font-bold">1,234</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h3 className="font-semibold">Placed</h3>
                            <p className="text-2xl font-bold">856</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h3 className="font-semibold">Companies</h3>
                            <p className="text-2xl font-bold">45</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h3 className="font-semibold">Avg Package</h3>
                            <p className="text-2xl font-bold">8.5 LPA</p>
                        </div>
                    </div>
                </div>
            );
    }
};

export default Index;
