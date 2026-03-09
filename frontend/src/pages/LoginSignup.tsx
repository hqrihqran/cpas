import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
    GraduationCap,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ChevronRight,
    Sparkles,
    BookOpen,
    BarChart3,
    Shield,
    X,
    CheckCircle2,
} from "lucide-react";
import { useAuth, NeedsRoleError } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// ─── Roles offered during sign-up ─────────────────────────────────────
const SIGNUP_ROLES = [
    { value: "student", label: "Student", icon: "🎓", desc: "Track your placements & tasks" },
    { value: "faculty", label: "Faculty", icon: "📚", desc: "Manage mentees & homework" },
    { value: "management", label: "Management", icon: "📊", desc: "View analytics & reports" },
    { value: "admin", label: "Admin", icon: "🛡️", desc: "Full system administration" },
];

// ─── Animated background blobs ────────────────────────────────────────
const BlobBg = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl" />
    </div>
);

// ─── Feature bullet list (left side) ──────────────────────────────────
const features = [
    { icon: BarChart3, text: "Real-time placement analytics" },
    { icon: BookOpen, text: "Task & interview tracking" },
    { icon: GraduationCap, text: "Student progress monitoring" },
    { icon: Shield, text: "Role-based access control" },
];

// ─── Google Role Picker Modal ──────────────────────────────────────────
interface GoogleRoleModalProps {
    googleName: string;
    googleEmail: string;
    onConfirm: (role: string) => void;
    onCancel: () => void;
    loading: boolean;
}

function GoogleRoleModal({ googleName, googleEmail, onConfirm, onCancel, loading }: GoogleRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState("");

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(2, 4, 18, 0.85)", backdropFilter: "blur(8px)" }}
                onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/60"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Choose your role</h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Welcome, <span className="text-indigo-400 font-medium">{googleName}</span>!<br />
                                <span className="text-slate-500 text-xs">{googleEmail}</span>
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Role grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {SIGNUP_ROLES.map((r) => {
                            const isSelected = selectedRole === r.value;
                            return (
                                <button
                                    key={r.value}
                                    onClick={() => setSelectedRole(r.value)}
                                    className={`
                                        relative p-4 rounded-2xl text-left border transition-all duration-200
                                        ${isSelected
                                            ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20"
                                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-400" />
                                    )}
                                    <div className="text-2xl mb-2">{r.icon}</div>
                                    <div className={`font-semibold text-sm ${isSelected ? "text-indigo-300" : "text-white"}`}>
                                        {r.label}
                                    </div>
                                    <div className="text-slate-500 text-xs mt-0.5">{r.desc}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => selectedRole && onConfirm(selectedRole)}
                            disabled={!selectedRole || loading}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main component ────────────────────────────────────────────────────
export default function LoginSignup() {
    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [tab, setTab] = useState<"login" | "signup">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("student");
    const [confirmPassword, setConfirm] = useState("");

    // Google Role Picker state
    const [pendingGoogleCred, setPendingGoogleCred] = useState<string | null>(null);
    const [googleUserInfo, setGoogleUserInfo] = useState<{ name: string; email: string } | null>(null);
    const [googleRoleLoading, setGoogleRoleLoading] = useState(false);

    const redirectAfterAuth = useCallback(() => {
        navigate("/home", { replace: true });
    }, [navigate]);

    // ── Email / Password submit ──────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (tab === "signup") {
            if (password !== confirmPassword) {
                toast({ title: "Passwords don't match", variant: "destructive" });
                return;
            }
            if (!fullName.trim()) {
                toast({ title: "Full name is required", variant: "destructive" });
                return;
            }
        }

        setLoading(true);
        try {
            if (tab === "login") {
                await login(email, password);
            } else {
                await register(email, password, fullName, role);
            }
            toast({ title: tab === "login" ? "Welcome back! 👋" : "Account created! 🎉" });
            redirectAfterAuth();
        } catch (err: any) {
            toast({ title: err.message ?? "Something went wrong", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ── Google Phase 1: receive credential → may need role ───────────────
    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setLoading(true);
        try {
            await googleLogin(credentialResponse.credential);
            toast({ title: "Signed in with Google 🎉" });
            redirectAfterAuth();
        } catch (err: any) {
            if (err instanceof NeedsRoleError) {
                // New user – show role picker modal
                setPendingGoogleCred(err.credential);
                setGoogleUserInfo({ name: err.googleName, email: err.googleEmail });
            } else {
                toast({ title: err.message ?? "Google sign-in failed", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Google Phase 2: user picked a role ──────────────────────────────
    const handleGoogleRoleConfirm = async (chosenRole: string) => {
        if (!pendingGoogleCred) return;
        setGoogleRoleLoading(true);
        try {
            await googleLogin(pendingGoogleCred, chosenRole);
            toast({ title: "Account created! Welcome 🎉" });
            setPendingGoogleCred(null);
            setGoogleUserInfo(null);
            redirectAfterAuth();
        } catch (err: any) {
            toast({ title: err.message ?? "Failed to create account", variant: "destructive" });
        } finally {
            setGoogleRoleLoading(false);
        }
    };

    const handleGoogleRoleCancel = () => {
        setPendingGoogleCred(null);
        setGoogleUserInfo(null);
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen w-full flex relative bg-slate-950 text-white">
                <BlobBg />

                {/* Google Role Picker Modal */}
                {pendingGoogleCred && googleUserInfo && (
                    <GoogleRoleModal
                        googleName={googleUserInfo.name}
                        googleEmail={googleUserInfo.email}
                        onConfirm={handleGoogleRoleConfirm}
                        onCancel={handleGoogleRoleCancel}
                        loading={googleRoleLoading}
                    />
                )}

                {/* ── Left panel (branding) ─────────────────────────────── */}
                <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 relative">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Campus Compass
                        </span>
                    </Link>

                    {/* Hero copy */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-2 text-indigo-400 text-sm font-medium"
                            >
                                <Sparkles className="h-4 w-4" />
                                Placement Analytics Platform
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-5xl font-extrabold leading-tight"
                            >
                                Empowering
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                                    Campus Careers
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-slate-400 text-lg leading-relaxed max-w-md"
                            >
                                A unified platform for students, faculty, and placement officers
                                to manage placements, track progress, and gain insights.
                            </motion.p>
                        </div>

                        {/* Feature bullets */}
                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            {features.map(({ icon: Icon, text }, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <span className="text-slate-300 text-sm">{text}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>

                    <p className="text-slate-600 text-xs">
                        © {new Date().getFullYear()} Campus Compass. All rights reserved.
                    </p>
                </div>

                {/* ── Right panel (form) ────────────────────────────────── */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-14">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="w-full max-w-md"
                    >
                        {/* Card */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">

                            {/* Mobile logo */}
                            <div className="flex lg:hidden items-center gap-2 mb-6">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-white">Campus Compass</span>
                            </div>

                            {/* Tab switcher */}
                            <div className="relative flex bg-white/5 rounded-2xl p-1 mb-8">
                                <motion.div
                                    layoutId="tab-bg"
                                    className="absolute inset-y-1 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30"
                                    style={{ width: "calc(50% - 4px)" }}
                                    animate={{ x: tab === "signup" ? "calc(100% + 8px)" : 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                />
                                {(["login", "signup"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${tab === t ? "text-white" : "text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        {t === "login" ? "Sign In" : "Sign Up"}
                                    </button>
                                ))}
                            </div>

                            {/* Heading */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {tab === "login" ? "Welcome back" : "Create your account"}
                                    </h2>
                                    <p className="text-slate-400 text-sm mb-6">
                                        {tab === "login"
                                            ? "Sign in to your Campus Compass account"
                                            : "Join Campus Compass today"}
                                    </p>

                                    {/* ── Form ── */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Name (signup only) */}
                                        {tab === "signup" && (
                                            <div className="space-y-1.5">
                                                <Label className="text-slate-300 text-xs font-medium">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                                    <Input
                                                        id="full_name"
                                                        type="text"
                                                        placeholder="Rahul Sharma"
                                                        value={fullName}
                                                        onChange={e => setFullName(e.target.value)}
                                                        required
                                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-300 text-xs font-medium">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-300 text-xs font-medium">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(p => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password + Role select (signup only) */}
                                        {tab === "signup" && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <Label className="text-slate-300 text-xs font-medium">Confirm Password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                                        <Input
                                                            id="confirm_password"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            value={confirmPassword}
                                                            onChange={e => setConfirm(e.target.value)}
                                                            required
                                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-slate-300 text-xs font-medium">Role</Label>
                                                    <Select value={role} onValueChange={setRole}>
                                                        <SelectTrigger
                                                            id="role"
                                                            className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 rounded-xl"
                                                        >
                                                            <SelectValue placeholder="Select your role" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                            {SIGNUP_ROLES.map(r => (
                                                                <SelectItem
                                                                    key={r.value}
                                                                    value={r.value}
                                                                    className="focus:bg-indigo-600/20 focus:text-white"
                                                                >
                                                                    {r.icon} {r.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}

                                        {/* Forgot password (login only) */}
                                        {tab === "login" && (
                                            <div className="flex justify-end">
                                                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                    Forgot password?
                                                </button>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <Button
                                            id="auth-submit-btn"
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    {tab === "login" ? "Signing in…" : "Creating account…"}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    {tab === "login" ? "Sign In" : "Create Account"}
                                                    <ChevronRight className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative my-5">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-transparent text-slate-500">or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google button */}
                                    <div className="flex justify-center">
                                        {GOOGLE_CLIENT_ID ? (
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={() =>
                                                    toast({ title: "Google sign-in failed", variant: "destructive" })
                                                }
                                                theme="filled_black"
                                                shape="pill"
                                                size="large"
                                                text={tab === "login" ? "signin_with" : "signup_with"}
                                            />
                                        ) : (
                                            <div className="w-full flex items-center justify-center gap-3 h-11 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm cursor-not-allowed select-none">
                                                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                Google OAuth not configured
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
