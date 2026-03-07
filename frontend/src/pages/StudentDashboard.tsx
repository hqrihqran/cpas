import { useRole } from "@/contexts/RoleContext";
import { StudentView } from "@/components/dashboard/StudentView";
import { FacultyView } from "@/components/dashboard/FacultyView";
import { ManagementView } from "@/components/dashboard/ManagementView";
import { AdminView } from "@/components/dashboard/AdminView";
import { CompanyView } from "@/components/dashboard/CompanyView";

const StudentDashboard = () => {
    const { role } = useRole();

    // Map roles to views
    const renderView = () => {
        switch (role) {
            case "student":
                return <StudentView />;
            case "faculty":
                return <FacultyView />;
            case "management":
                return <ManagementView />;
            case "admin":
                return <AdminView />;
            case "company":
                return <CompanyView />;
            // Fallback for any other legacy roles or defaults
            default:
                return <StudentView />;
        }
    };

    return (
        <div key={role} className="w-full h-full">
            {renderView()}
        </div>
    );
};

export default StudentDashboard;
