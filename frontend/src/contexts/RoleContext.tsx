import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole =
  | "admin"
  | "placement_officer"
  | "faculty"
  | "student"
  | "management"
  | "company";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleName: string;
}

const roleNames: Record<UserRole, string> = {
  admin: "Admin",
  placement_officer: "Placement Officer",
  faculty: "Faculty",
  student: "Student",
  management: "Management",
  company: "Company",
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Derive role from authenticated user; fall back to "student" for demo
  const [role, setRole] = useState<UserRole>(
    (user?.role as UserRole) ?? "student"
  );

  // Keep role in sync when the user logs in / logs out
  useEffect(() => {
    if (user?.role) {
      setRole(user.role as UserRole);
    } else {
      setRole("student");
    }
  }, [user]);

  return (
    <RoleContext.Provider value={{ role, setRole, roleName: roleNames[role] ?? role }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}
