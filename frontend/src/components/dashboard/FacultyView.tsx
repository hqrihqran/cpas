import { useLocation } from "react-router-dom";
import { FacultyMe } from "./FacultyMe";
import { FacultyStudents } from "./FacultyStudents";
import { FacultyHomework } from "./FacultyHomework";

export function FacultyView() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "me";

    return (
        <div className="w-full">
            {tab === "me" && <FacultyMe />}
            {tab === "students" && <FacultyStudents />}
            {tab === "homework" && <FacultyHomework />}
        </div>
    );
}
