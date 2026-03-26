import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Home,
    LineChart,
    MessageCircle,
    Trophy,
    User,
    Bell,
    ChevronDown,
    GraduationCap,
    Building2,
    Users,
    Check,
    FileText,
    LogOut,
    GitBranch,
    Presentation
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useRole, UserRole } from "@/contexts/RoleContext";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotificationPopover } from "./NotificationPopover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOBILE_LABEL_WIDTH = 90;

function useClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}


function RoleSwitcher() {
    const { role, setRole } = useRole();
    const { isAuthenticated } = useAuth();

    const roles: { id: UserRole; label: string; icon: any }[] = [
        { id: "student", label: "Student", icon: GraduationCap },
        { id: "faculty", label: "Faculty", icon: Users },
        { id: "management", label: "Management", icon: Building2 },
        { id: "admin", label: "Admin", icon: User },
        { id: "company", label: "Company", icon: Building2 },
    ];

    const currentRole = roles.find(r => r.id === role) || roles[0];
    const Icon = currentRole.icon;


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline text-xs font-medium">{currentRole.label} View</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map((r) => (
                    <DropdownMenuItem
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={cn(
                            "gap-2 cursor-pointer",
                            role === r.id && "bg-primary/10 text-primary focus:bg-primary/20"
                        )}
                    >
                        <r.icon className="h-4 w-4" />
                        <span>{r.label}</span>
                        {role === r.id && <Check className="ml-auto h-3 w-3" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function TopNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { role } = useRole();
    const { isAuthenticated, logout, user } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getNavItems = () => {
        if (role === "management") {
            return [
                { label: "Analytics", icon: LineChart, href: "/analytics" },
                { label: "Trainings", icon: Presentation, href: "/skill-gap" },
            ];
        }
        if (role === "faculty") {
            return [
                { label: "Me", icon: User, href: "/student-dashboard?tab=me" },
                { label: "All Students", icon: Users, href: "/student-dashboard?tab=students" },
                { label: "Homework Hub", icon: FileText, href: "/student-dashboard?tab=homework" },
            ];
        }
        return [
            { label: "Dashboard", icon: Home, href: "/student-dashboard" },
            { label: "Pipelined", icon: GitBranch, href: "/pipelined" },
            { label: "My Applications", icon: LineChart, href: "/applications" },
            { label: "Interviews", icon: MessageCircle, href: "/interviews" },
        ];
    };

    const navItems = getNavItems();

    useEffect(() => {
        const fullPath = location.pathname + location.search;
        let index = navItems.findIndex(item => item.href === fullPath);
        if (index === -1) {
            // fallback for exact pathname without search
            index = navItems.findIndex(item => item.href.split('?')[0] === location.pathname);
        }
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [location.pathname, location.search, role]);

    const handleNavClick = (index: number, href: string) => {
        setActiveIndex(index);
        navigate(href);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header
            className={cn(
                "sticky top-4 z-[1000] h-[72px] transition-all duration-300",
                "bg-white/80 dark:bg-slate-950/80 backdrop-blur-[12px]",
                "border border-black/[0.05] dark:border-white/[0.05]",
                "rounded-3xl mt-4 mx-auto w-[calc(100%-2rem)] max-w-7xl",
                "shadow-sm" // Uses the global box-shadow defined in index.css
            )}
        >
            <div className="w-full h-full px-4 md:px-6 flex items-center justify-between relative">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 font-bold text-xl text-primary shrink-0 z-10">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        CC
                    </div>
                    <span className="hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Campus Compass
                    </span>
                </div>

                {/* Center: The "BottomNavBar" Pill */}
                {/* Positioned absolutely to center relative to the container */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-0">
                    <nav
                        className={cn(
                            "relative flex items-center h-full px-2",
                            "transition-all duration-300"
                        )}
                    >
                        {navItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isActive = activeIndex === idx;

                            return (
                                <div key={item.label} className="flex items-center">
                                    {idx > 0 && (
                                        <div className="h-8 w-[1px] bg-[#DDDDDD] dark:bg-white/10 mx-1" />
                                    )}
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        className={cn(
                                            "flex items-center gap-0 px-5 py-2 rounded-full transition-all duration-300 relative h-12 min-w-[48px]",
                                            isActive
                                                ? "bg-transparent text-[#1D1D1F] dark:text-white font-bold"
                                                : "bg-transparent text-muted-foreground hover:bg-[#F7F7F7] dark:hover:bg-white/5 hover:text-foreground",
                                            "focus:outline-none focus-visible:ring-0",
                                        )}
                                        onClick={() => handleNavClick(idx, item.href)}
                                        aria-label={item.label}
                                        type="button"
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={2.5}
                                            className="transition-transform duration-300"
                                        />

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                width: isActive ? "auto" : "0px",
                                                opacity: isActive ? 1 : 0,
                                                marginLeft: isActive ? "8px" : "0px",
                                            }}
                                            transition={{
                                                width: { type: "spring", stiffness: 350, damping: 32 },
                                                opacity: { duration: 0.3 },
                                                marginLeft: { duration: 0.3 },
                                            }}
                                            className="overflow-hidden flex items-center"
                                        >
                                            <span className="text-xs whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        </motion.div>
                                    </motion.button>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0 z-10">
                    <div className="hidden sm:flex">
                        <NotificationPopover />
                    </div>

                    <div className="hidden md:block">
                        <RoleSwitcher />
                    </div>

                    <ModeToggle />

                    <div className="flex items-center gap-3 pl-2 border-l border-muted relative" ref={dropdownRef}>
                        <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-muted cursor-pointer hover:ring-primary/50 transition-all">
                                <AvatarImage src={(user as any)?.picture || "/placeholder-user.jpg"} alt={(user as any)?.displayName || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold shadow-sm select-none">
                                    {(user?.full_name || (user as any)?.displayName || (user as any)?.givenName || "HA").substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {isDropdownOpen && (
                            <div className="absolute top-12 right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-lg shadow-black/5 outline-none animate-in fade-in-0 zoom-in-95">
                                <div className="px-4 py-3 border-b">
                                    <p className="text-sm font-semibold truncate leading-none mb-1">
                                        {(user as any)?.displayName || user?.full_name || "Student User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate leading-none">
                                        {user?.email || "student@example.com"}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                                        <User className="mr-2 h-4 w-4" />
                                        View Full Profile
                                    </Link>
                                </div>
                                <div className="h-px bg-muted" />
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            localStorage.removeItem('cpas_tokens');
                                            handleLogout();
                                        }}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-destructive/10 text-destructive focus:bg-accent focus:text-accent-foreground"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

