import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Bell, Check, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
    id: string;
    type: string;
    description: string;
    timestamp: string | Date;
    read?: boolean;
    link?: string;
}

export function NotificationPopover() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [viewAll, setViewAll] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();

    // Socket connection
    useEffect(() => {
        if (!isAuthenticated) return;

        // Initialize socket - assumes Vite proxy or same-origin deployment handles the routing
        // If your backend runs on a different port without proxy, adjust the URL, e.g., io("http://localhost:5000")
        const socketUrl = import.meta.env.VITE_API_URL || undefined;
        // Make sure we pass the JWT in the auth payload or query!
        const token = localStorage.getItem("cpas_tokens") ? JSON.parse(localStorage.getItem("cpas_tokens") as string).access_token : "";

        const socket: Socket = io(socketUrl as string, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            auth: {
                token: token
            },
            query: {
                token: token
            }
        });

        socket.on("connect", () => {
            console.log("Connected to notification socket");
        });

        socket.on("new_notification", (data: AppNotification | any) => {
            console.log("New notification received:", data);

            const newNotif: AppNotification = {
                id: data.id || Math.random().toString(36).substring(2, 9),
                type: data.type || "System",
                description: data.description || "You have a new notification",
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        socket.on("new_task_assigned", (newTask: any) => {
            console.log("New task assigned notification:", newTask);

            const newNotif: AppNotification = {
                id: newTask.id || Math.random().toString(36).substring(2, 9),
                type: "Task",
                description: newTask.title || "A new task has been assigned.",
                timestamp: new Date().toISOString(),
                read: false,
                link: "#tasks-from-mentor"
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.off("connect");
            socket.off("new_notification");
            socket.off("new_task_assigned");
            socket.disconnect();
        };
    }, [isAuthenticated]);

    // Handle click outside to close popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // Mark as read when opening

            // Also mark individual items as read locally just for UI consistency
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const formatTime = (ts: string | Date) => {
        try {
            const date = new Date(ts);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "";
        }
    };

    const handleNotificationClick = (notif: AppNotification) => {
        if (notif.link) {
            setIsOpen(false);
            if (notif.link.startsWith('#')) {
                const element = document.getElementById(notif.link.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = notif.link;
            }
        }
    };

    const displayNotifications = viewAll ? notifications : notifications.slice(0, 3);

    return (
        <div className="relative" ref={popoverRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                className={cn(
                    "relative text-muted-foreground hover:text-foreground transition-all duration-200",
                    isOpen ? "bg-muted text-foreground" : ""
                )}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"
                    />
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute right-0 top-[calc(100%+12px)] w-80 sm:w-96 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col glassmorphic-popover"
                        style={{
                            background: "rgba(255, 255, 255, 0.75)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(226, 232, 240, 0.8)",
                        }}
                    >
                        {/* Dark mode overriding via inline style or classes - we use a mix of both for robustness */}
                        <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 pointer-events-none -z-10" />

                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50">
                            <h3 className="font-semibold gap-2 flex items-center text-sm">
                                Notifications
                                {notifications.length > 0 && (
                                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                        {notifications.length}
                                    </span>
                                )}
                            </h3>
                            {notifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setNotifications([])}
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>

                        <div
                            className={cn(
                                "flex flex-col flex-1",
                                viewAll ? "max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin" : "max-h-auto"
                            )}
                        >
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <AnimatePresence>
                                        {displayNotifications.map((notif, index) => (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "group relative flex items-start gap-3 p-4 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors",
                                                    notif.link ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"
                                                )}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn(
                                                            "text-xs font-medium px-2 py-0.5 rounded-md",
                                                            notif.type.toLowerCase() === 'job' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                            notif.type.toLowerCase() === 'task' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                                            notif.type.toLowerCase() === 'alert' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                            !['job', 'task', 'alert'].includes(notif.type.toLowerCase()) && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                        )}>
                                                            [{notif.type}]
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {formatTime(notif.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className={cn("text-sm text-foreground/90 leading-tight", notif.link && "hover:underline underline-offset-2")}>
                                                        {notif.description}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {notifications.length > 3 && (
                            <div className="p-2 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs font-medium"
                                    onClick={() => setViewAll(!viewAll)}
                                >
                                    {viewAll ? "View Less" : `View All (${notifications.length})`}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
