import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    function loginUser(authResponse) {
        try {
            const token = authResponse.token;
            const payloadBase64 = token.split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            const userId = payload.sub ? parseInt(payload.sub, 10) : null;

            const userData = {
                ...authResponse,
                userId
            };

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        } catch (e) {
            console.error("Nie udało się zdekodować tokena JWT:", e);
            localStorage.setItem("token", authResponse.token);
            localStorage.setItem("user", JSON.stringify(authResponse));
            setUser(authResponse);
        }
    }

    function logoutUser() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    const value = { user, loginUser, logoutUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
