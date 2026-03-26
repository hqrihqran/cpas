import {
  LayoutDashboard, BarChart3, Users, FileText, Database, ChevronDown, GraduationCap, Building2, ShieldCheck, UserCog, GitBranch, Presentation,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useRole, UserRole } from "@/contexts/RoleContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems: Record<UserRole, { title: string; url: string; icon: any }[]> = {
  admin: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Data Management", url: "/data-management", icon: Database },
    { title: "Student Tracking", url: "/students", icon: Users },
    { title: "Reports", url: "/reports", icon: FileText },
  ],
  placement_officer: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Student Tracking", url: "/students", icon: Users },
    { title: "Company Insights", url: "/companies", icon: Building2 },
    { title: "Reports", url: "/reports", icon: FileText },
  ],
  faculty: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Student Tracking", url: "/students", icon: Users },
    { title: "Reports", url: "/reports", icon: FileText },
  ],
  student: [
    { title: "Dashboard", url: "/student-dashboard", icon: LayoutDashboard },
    { title: "Pipelined", url: "/pipelined", icon: GitBranch },
    { title: "My Applications", url: "/applications", icon: FileText },
    { title: "Interviews", url: "/interviews", icon: Users },
  ],
  management: [
    { title: "Dashboard", url: "/analytics", icon: LayoutDashboard },
    { title: "Skill Gap & Trainings", url: "/skill-gap", icon: Presentation },
    { title: "Overall Stats", url: "/analytics", icon: BarChart3 },
    { title: "Placement Reports", url: "/reports", icon: FileText },
  ],
  company: [
    { title: "Dashboard", url: "/companies", icon: LayoutDashboard },
    { title: "My Job Postings", url: "/companies", icon: FileText },
    { title: "Applicants", url: "/students", icon: Users },
  ],
};

const roleConfig: Record<UserRole, { label: string; icon: any }> = {
  admin: { label: "Admin", icon: ShieldCheck },
  placement_officer: { label: "Placement Officer", icon: UserCog },
  faculty: { label: "Faculty", icon: GraduationCap },
  student: { label: "Student", icon: GraduationCap },
  management: { label: "Management", icon: UserCog },
  company: { label: "Company", icon: Building2 },
};

export function AppSidebar() {
  const { role, setRole } = useRole();
  const items = navItems[role];
  const currentRole = roleConfig[role];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">CPAS</span>
            <span className="text-xs text-sidebar-foreground/60">Placement Analytics</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors">
              <currentRole.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{currentRole.label}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            {(Object.keys(roleConfig) as UserRole[]).map((r) => {
              const cfg = roleConfig[r];
              return (
                <DropdownMenuItem
                  key={r}
                  onClick={() => {
                    setRole(r);
                    // Optional: Navigate to dashboard start page if needed
                  }}
                  className={role === r ? "bg-accent" : ""}
                >
                  <cfg.icon className="h-4 w-4 mr-2" />
                  {cfg.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
