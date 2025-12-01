import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import * as authApi from "../api/authApi";

export default function LoginPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);
            const authResponse = await authApi.login(email, password);
            loginUser(authResponse);
            navigate("/resources");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data ?? "Failed to load. Try again later.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{ maxWidth: 540 }}>
            <h2>Log in</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {error && <div style={{ color: "red" }}>{error}</div>}

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? "Loggin in..." : "Log in"}
                    </button>
                    <Link to="/register" className="btn btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        Register
                    </Link>
                </div>
            </form>
        </div>
    );
}