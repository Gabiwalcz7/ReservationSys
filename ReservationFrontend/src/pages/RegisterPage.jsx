import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as authApi from "../api/authApi";
import { useAuth } from "../hooks/AuthProvider";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!fullName || !email || !password) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords dont match.");
            return;
        }

        try {
            setLoading(true);
            await authApi.register(fullName, email, password);
            setSuccess("Succesfully registered...");
            try {
                const authResponse = await authApi.login(email, password);
                loginUser(authResponse);
                navigate("/resources");
            } catch (loginErr) {
                console.warn("Auto-login failed after registration.", loginErr);
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data ?? "Failed to register.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{ maxWidth: 640 }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {error && <div style={{ color: "red" }}>{error}</div>}
                {success && <div style={{ color: "green" }}>{success}</div>}

                <label>
                    Full name
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                </label>

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
                        minLength={6}
                        style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                </label>

                <label>
                    Confirm password
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? "registering..." : "Register"}
                    </button>
                    <Link to="/login" className="btn btn-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        Already have an account? Log in.
                    </Link>
                </div>
            </form>
        </div>
    );
}