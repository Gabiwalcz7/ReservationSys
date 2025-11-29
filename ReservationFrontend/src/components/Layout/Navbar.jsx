import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";

const linkStyle = {
    marginRight: "1rem",
    color: "#fff",
    textDecoration: "none",
};

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    return (
        <nav style={{ padding: "0.75rem 1.5rem", background: "#222", color: "#fff" }}>
            <Link to="/resources" style={linkStyle}>Zasoby</Link>

            {user && (
                <Link to="/my-reservations" style={linkStyle}>
                    Moje rezerwacje
                </Link>
            )}

            {user?.role === "Admin" && (
                <>
                    <Link to="/admin" style={linkStyle}>Panel admina</Link>
                    <Link to="/report" style={linkStyle}>Raport</Link>
                </>
            )}

            <span style={{ float: "right" }}>
                {!user && (
                    <>
                        <Link to="/login" style={linkStyle}>Logowanie</Link>
                        <Link to="/register" style={linkStyle}>Rejestracja</Link>
                    </>
                )}

                {user && (
                    <button
                        onClick={handleLogout}
                        style={{ color: "#fff", background: "none", border: "none", cursor: "pointer" }}
                    >
                        Wyloguj ({user.fullName})
                    </button>
                )}
            </span>
        </nav>
    );
}
