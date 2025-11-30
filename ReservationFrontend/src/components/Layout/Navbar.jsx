import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate("/login");
    }

    const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

    return (
        <nav className="app-nav" role="navigation" aria-label="Main navigation">
            <div className="nav-left">

                <NavLink to="/resources" className={linkClass}>
                    Items for reservation
                </NavLink>

                {user && (
                    <NavLink to="/my-reservations" className={linkClass}>
                        My reservations
                    </NavLink>
                )}

                {user?.role === "Admin" && (
                    <>
                        <NavLink to="/admin" className={linkClass}>Reservations</NavLink>
                        <NavLink to="/report" className={linkClass}>Report</NavLink>
                        <NavLink to="/resources/new" className={linkClass}>Add item</NavLink>
                    </>
                )}
            </div>

            <div className="nav-right">
                {!user ? (
                    <>
                        <NavLink to="/login" className={linkClass}>Login</NavLink>
                        <NavLink to="/register" className={linkClass}>Register</NavLink>
                    </>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost"
                        aria-label={`Logout ${user.fullName}`}
                    >
                        Logout ({user.fullName})
                    </button>
                )}
            </div>
        </nav>
    );
}