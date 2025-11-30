import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { getReservationsByUser, deleteUserReservation } from "../api/reservationApi";
import { Link } from "react-router-dom";

export default function MyReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.userId) {
            setError("You have to be logged in.");
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getReservationsByUser(user.userId);
                setReservations(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your reservations.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    async function handleCancel(id) {
        if (!window.confirm("Are you sure you want to cancel?")) return;

        try {
            await deleteUserReservation(id);
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data ?? "Failed to cancel.");
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!reservations || reservations.length === 0) {
        return <p>You dont have any reservations.</p>;
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return (
        <div className="container">
            <h2>My reservations</h2>

            <div className="reservations" style={{ marginTop: "1rem" }}>
                {reservations.map((r) => (
                    <div key={r.id} className="reservation-card" role="article" aria-labelledby={`res-title-${r.id}`}>
                        <div className="reservation-header">
                            <div id={`res-title-${r.id}`} className="reservation-title">
                                {r.resourceName ?? r.resource?.name ?? `ID: ${r.resourceId}`}
                            </div>
                            <div className="reservation-meta">
                                {formatDate(r.startTime)} - {formatDate(r.endTime)}
                            </div>
                        </div>

                        <div className="reservation-meta">
                            Status: {r.statusName ?? r.status?.name ?? r.statusId ?? "-"}
                        </div>

                        <div className="reservation-meta">
                            User: {r.userName ?? user?.fullName ?? user?.email ?? "-"}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <Link to={`/my-reservations/${r.id}/edit`} className="btn btn-secondary" aria-label={`Edit ${r.id}`}>
                                Edit
                            </Link>
                            <button className="btn btn-danger" onClick={() => handleCancel(r.id)} aria-label={`Cancel ${r.id}`}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}