import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "placement_officer" | "faculty" | "student" | "management" | "company";

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
  const [role, setRole] = useState<UserRole>("student");

  return (
    <RoleContext.Provider value={{ role, setRole, roleName: roleNames[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}
