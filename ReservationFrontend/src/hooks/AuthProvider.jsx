/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;

        try {
            const parsed = JSON.parse(savedUser);
            if (parsed?.expiresAt) {
                const exp = new Date(parsed.expiresAt).getTime();
                if (Number.isFinite(exp) && exp <= Date.now()) {
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    return null;
                }
            }
            return parsed;
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    const navigate = useNavigate();
    const logoutTimerRef = useRef(null);
    const warningTimerRef = useRef(null);

    function logoutUser() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);

        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        setShowTimeoutWarning(false);
    }

    function loginUser(authResponse) {
        try {
            const token = authResponse.token;
            const payloadBase64 = token
                .split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            const userId = payload.sub ? parseInt(payload.sub, 10) : null;

            const userData = { ...authResponse, userId };

            if (userData.expiresAt) {
                const exp = new Date(userData.expiresAt).getTime();
                if (Number.isFinite(exp) && exp <= Date.now()) {
                    return;
                }
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        } catch (e) {
            console.error("JWT decode failed:", e);
            localStorage.setItem("token", authResponse.token);
            localStorage.setItem("user", JSON.stringify(authResponse));
            setUser(authResponse);
        }
    }

    useEffect(() => {
        if (!user?.expiresAt) return;

        const expiresTime = new Date(user.expiresAt).getTime();
        const now = Date.now();
        const timeout = expiresTime - now;

        if (!Number.isFinite(timeout) || timeout <= 0) {
            return;
        }

        const warningTime = timeout - 30000;

        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        if (warningTime > 0) {
            warningTimerRef.current = setTimeout(() => {
                setShowTimeoutWarning(true);
            }, warningTime);
        }

        logoutTimerRef.current = setTimeout(() => {
            logoutUser();
            navigate("/login");
        }, timeout);

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, [user?.expiresAt, navigate]);

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}

            {showTimeoutWarning && (
                <div className="session-warning">
                    <div className="session-box">
                        <p>Your session is going to end</p>
                        <button onClick={() => setShowTimeoutWarning(false)}>
                            Stay logged in
                        </button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
