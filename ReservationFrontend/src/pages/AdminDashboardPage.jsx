import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import {
    getAllReservations,
    approveReservation,
    rejectReservation,
} from "../api/reservationApi";

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (user?.role !== "Admin") {
            navigate("/");
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getAllReservations();
                setReservations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load reservations");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user, navigate]);

    function computeStats(list) {
        const stats = { total: list.length, byStatus: {} };
        for (const r of list) {
            const key = r.statusName ?? r.status?.name ?? String(r.statusId ?? "Unknown");
            stats.byStatus[key] = (stats.byStatus[key] || 0) + 1;
        }
        return stats;
    }

    const stats = computeStats(reservations);

    const filtered = reservations.filter((r) => {
        if (filter === "All") return true;
        const status = r.statusName ?? r.status?.name ?? String(r.statusId ?? "");
        return status === filter;
    });

    async function handleAction(id, action) {
        if (!window.confirm(`Are your sure you want to ${action} reservation?`)) return;
        try {
            setProcessingId(id);

            let updated = null;
            if (action === "approve") {
                updated = await approveReservation(id, user.userId, "");
            } else {
                updated = await rejectReservation(id, user.userId, "");
            }

            setReservations((prev) =>
                prev.map((r) => {
                    if (r.id !== id) return r;

                    if (updated && typeof updated === "object" && Object.keys(updated).length > 0) {
                        return { ...r, ...updated };
                    }

                    const statusName = action === "approve" ? "Approved" : "Rejected";
                    return {
                        ...r,
                        statusName,
                    };
                })
            );
        } catch (err) {
            console.error(err);
            alert(err.response?.data ?? "Failed.");
        } finally {
            setProcessingId(null);
        }
    }

    if (loading) return <div className="container"><p>Wczytywanie panelu administracyjnego...</p></div>;
    if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

    return (
        <div className="container">
            <h2>Reservations:</h2>

            <section style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700 }}>Stats:</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="reservation-meta" style={{ padding: "6px 10px", background: "#eef2f8", borderRadius: 8 }}>
                        All: {stats.total}
                    </div>
                    {Object.entries(stats.byStatus).map(([k, v]) => (
                        <div key={k} className="reservation-meta" style={{ padding: "6px 10px", background: "#fff7ed", borderRadius: 8 }}>
                            {k}: {v}
                        </div>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
                        <option>All</option>
                        {Array.from(new Set(reservations.map(r => r.statusName ?? r.status?.name ?? String(r.statusId ?? "Unknown")))).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button className="btn btn-secondary" onClick={() => {
                        setLoading(true);
                        getAllReservations()
                            .then(d => setReservations(d))
                            .finally(() => setLoading(false));
                    }}>
                        Odśwież
                    </button>
                </div>
            </section>

            <div className="reservations" style={{ marginTop: 16 }}>
                {filtered.map(r => (
                    <article key={r.id} className="reservation-card" role="article" aria-labelledby={`res-${r.id}`}>
                        <div className="reservation-header">
                            <div id={`res-${r.id}`} className="reservation-title">
                                {r.resourceName ?? r.resource?.name ?? `ID: ${r.resourceId}`}
                            </div>
                            <div className="reservation-meta">
                                {new Date(r.startTime).toLocaleString("pl-PL", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })} — {new Date(r.endTime).toLocaleString("pl-PL", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </div>
                        </div>

                        <div className="reservation-meta">User: {r.userName ?? r.user?.fullName ?? r.user?.email ?? "-"}</div>
                        <div className="reservation-meta">Status: {r.statusName ?? r.status?.name ?? r.statusId ?? "-"}</div>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleAction(r.id, "approve")}
                                disabled={processingId === r.id || (r.statusName && r.statusName.toLowerCase() === "approved")}
                                aria-label={`Approve reservation ${r.id}`}
                            >
                                {processingId === r.id ? "..." : "Approve"}
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={() => handleAction(r.id, "reject")}
                                disabled={processingId === r.id || (r.statusName && r.statusName.toLowerCase() === "rejected")}
                                aria-label={`Reject reservation ${r.id}`}
                            >
                                {processingId === r.id ? "..." : "Reject"}
                            </button>
                        </div>
                    </article>
                ))}

                {filtered.length === 0 && <p className="reservation-meta">There's no reservation to approve.</p>}
            </div>
        </div>
    );
}