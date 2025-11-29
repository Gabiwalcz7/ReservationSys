import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { useAuth } from "../hooks/AuthProvider";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== password2) {
            setError("Hasła nie są takie same.");
            return;
        }

        try {
            const data = await register(fullName, email, password);
            // backend zwraca token + info o userze tak jak przy loginie
            loginUser(data);
            navigate("/resources");
        } catch (err) {
            console.error(err);
            setError("Rejestracja nie powiodła się. Spróbuj innym mailem lub hasłem.");
        }
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "320px", textAlign: "center" }}>
                <h2>Rejestracja</h2>

                <input
                    type="text"
                    placeholder="Imię i nazwisko"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

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
                    placeholder="Hasło (min. 6 znaków)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="password"
                    placeholder="Powtórz hasło"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Zarejestruj
                </button>
            </form>
        </div>
    );
}
