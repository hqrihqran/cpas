import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// All API calls go through the Vite proxy (/api/* → localhost:5000)
const API_BASE = "";

export interface AuthUser {
    id: number;
    email: string;
    full_name: string;
    /** lowercase role key: "student" | "faculty" | "management" | "admin" | "company" */
    role: string;
    student_id: number | null;
}

interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        email: string,
        password: string,
        full_name: string,
        role: string
    ) => Promise<void>;
    googleLogin: (credential: string, role?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USER_KEY = "cpas_user";
const LS_TOKENS_KEY = "cpas_tokens";

/**
 * Thrown by googleLogin when the backend responds with needs_role:true.
 * The LoginSignup page catches this and shows the role-picker modal.
 */
export class NeedsRoleError extends Error {
    googleName: string;
    googleEmail: string;
    credential: string;
    constructor(googleName: string, googleEmail: string, credential: string) {
        super("needs_role");
        this.name = "NeedsRoleError";
        this.googleName = googleName;
        this.googleEmail = googleEmail;
        this.credential = credential;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(LS_USER_KEY);
        const storedTokens = localStorage.getItem(LS_TOKENS_KEY);
        if (storedUser && storedTokens) {
            setUser(JSON.parse(storedUser));
            setTokens(JSON.parse(storedTokens));
        }
        setIsLoading(false);
    }, []);

    const _persistSession = useCallback((data: { user: AuthUser; access_token: string; refresh_token: string }) => {
        const t = { access_token: data.access_token, refresh_token: data.refresh_token };
        setUser(data.user);
        setTokens(t);
        localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(LS_TOKENS_KEY, JSON.stringify(t));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        let res: Response;
        try {
            res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
        } catch {
            throw new Error("Network Error: Cannot connect to the server. Make sure Flask is running.");
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid email or password");
        _persistSession(data);
    }, [_persistSession]);

    const register = useCallback(
        async (email: string, password: string, full_name: string, role: string) => {
            let res: Response;
            try {
                res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, full_name, role }),
                });
            } catch {
                throw new Error("Network Error: Cannot connect to the server. Make sure Flask is running.");
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Registration failed");
            _persistSession(data);
        },
        [_persistSession]
    );

    /**
     * Phase 1: call googleLogin(credential)           → may throw NeedsRoleError
     * Phase 2: call googleLogin(credential, role)     → creates user and logs in
     */
    const googleLogin = useCallback(async (credential: string, role?: string) => {
        const body: Record<string, string> = { credential };
        if (role) body.role = role;

        let res: Response;
        try {
            res = await fetch(`${API_BASE}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
        } catch {
            // fetch() itself threw — server unreachable
            throw new Error("Network Error: Cannot reach the server. Is Flask running?");
        }

        const data = await res.json();

        if (!res.ok) {
            // Surface the specific backend error cleanly
            const msg = data?.error ?? "Google sign-in failed";
            throw new Error(msg);
        }

        // Backend signals that a role must be chosen before user creation
        if (data.needs_role) {
            throw new NeedsRoleError(data.google_name, data.google_email, credential);
        }

        _persistSession(data);
    }, [_persistSession]);

    const logout = useCallback(() => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem(LS_USER_KEY);
        localStorage.removeItem(LS_TOKENS_KEY);
        // Optionally tell server:
        fetch(`${API_BASE}/api/auth/logout`, { method: "POST" }).catch(() => { });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                tokens,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                googleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
