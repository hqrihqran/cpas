import { useState, useEffect } from "react";
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
    FileText
} from "lucide-react";

import { useRole, UserRole } from "@/contexts/RoleContext";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOBILE_LABEL_WIDTH = 90;

function RoleSwitcher() {
    const { role, setRole } = useRole();

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
    const [activeIndex, setActiveIndex] = useState(0);
    const [scrolled, setScrolled] = useState(false);

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
                { label: "Analytics", icon: LineChart, href: "/student-dashboard" },
                { label: "To Focus", icon: Trophy, href: "/focus" },
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

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-200",
                "bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md",
                "border-b border-slate-200 dark:border-slate-800",
                scrolled ? "shadow-sm" : ""
            )}
        >
            <div className="container mx-auto h-full px-4 flex items-center justify-between relative">
                {/* Left: Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary shrink-0 z-10">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        CC
                    </div>
                    <span className="hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Campus Compass
                    </span>
                </Link>

                {/* Center: The "BottomNavBar" Pill */}
                {/* Positioned absolutely to center relative to the container */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-0">
                    <motion.nav
                        initial={{ scale: 0.9, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        className={cn(
                            "bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full flex items-center p-1 shadow-sm space-x-1",
                            "h-[52px]"
                        )}
                    >
                        {navItems.map((item, idx) => {
                            const Icon = item.icon;
                            const isActive = activeIndex === idx;

                            return (
                                <motion.button
                                    key={item.label}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        "flex items-center gap-0 px-4 py-2 rounded-full transition-all duration-300 relative h-10 min-w-[44px]",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                            : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                        "focus:outline-none focus-visible:ring-0",
                                    )}
                                    onClick={() => handleNavClick(idx, item.href)}
                                    aria-label={item.label}
                                    type="button"
                                >
                                    <Icon
                                        size={20}
                                        strokeWidth={2.5}
                                        aria-hidden
                                        className="transition-colors duration-200"
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
                                            opacity: { duration: 0.19 },
                                            marginLeft: { duration: 0.19 },
                                        }}
                                        className="overflow-hidden flex items-center"
                                    >
                                        <span className="font-semibold text-xs whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </motion.div>
                                </motion.button>
                            );
                        })}
                    </motion.nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0 z-10">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hidden sm:flex">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                    </Button>

                    <div className="hidden md:block">
                        <RoleSwitcher />
                    </div>

                    <ModeToggle />

                    <div className="flex items-center gap-3 pl-2 border-l border-muted">
                        <Avatar className="h-9 w-9 border-2 border-background ring-2 ring-muted cursor-pointer hover:ring-primary/50 transition-all">
                            <AvatarImage src="/placeholder-user.jpg" alt="User" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">HA</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    );
}

