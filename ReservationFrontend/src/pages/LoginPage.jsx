import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../hooks/AuthProvider"; 

export default function LoginPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const data = await login(email, password);
            loginUser(data);
            navigate("/resources");
        } catch (err) {
            console.error(err);
            setError("Niepoprawne dane logowania lub błąd połączenia.");
        }
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "300px", textAlign: "center" }}>
                <h2>Logowanie</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Zaloguj
                </button>
            </form>
        </div>
    );
}
