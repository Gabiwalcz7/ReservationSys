import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import {
    getAllReservations,
    approveReservation,
    rejectReservation,
} from "../api/reservationApi";

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // tylko admin ma dostęp
    if (!user || user.role !== "Admin") {
        return <p>Brak dostępu. Ta sekcja jest dostępna tylko dla administratora.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getAllReservations();
                setReservations(data);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać listy rezerwacji.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    function formatDate(dateString) {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleString("pl-PL");
    }

    async function handleApprove(id) {
        try {
            setActionError("");
            setActionLoadingId(id);
            await approveReservation(id, user.userId, "Approved by admin");
            // odśwież w pamięci
            setReservations(prev =>
                prev.map(r =>
                    r.id === id
                        ? { ...r, statusId: 2, status: { ...(r.status || {}), name: "Approved" } }
                        : r
                )
            );
        } catch (err) {
            console.error(err);
            setActionError("Nie udało się zatwierdzić rezerwacji.");
        } finally {
            setActionLoadingId(null);
        }
    }

    async function handleReject(id) {
        try {
            setActionError("");
            setActionLoadingId(id);
            await rejectReservation(id, user.userId, "Rejected by admin");
            setReservations(prev =>
                prev.map(r =>
                    r.id === id
                        ? { ...r, statusId: 3, status: { ...(r.status || {}), name: "Rejected" } }
                        : r
                )
            );
        } catch (err) {
            console.error(err);
            setActionError("Nie udało się odrzucić rezerwacji.");
        } finally {
            setActionLoadingId(null);
        }
    }

    if (loading) {
        return <p>Wczytywanie rezerwacji...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!reservations || reservations.length === 0) {
        return <p>Brak rezerwacji w systemie.</p>;
    }

    return (
        <div>
            <h2>Panel administratora – rezerwacje</h2>

            {actionError && <p style={{ color: "red" }}>{actionError}</p>}

            <table style={{ borderCollapse: "collapse", minWidth: "900px", marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Użytkownik</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Zasób</th>
                        <th style={thStyle}>Od</th>
                        <th style={thStyle}>Do</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((r) => (
                        <tr key={r.id}>
                            <td style={tdStyle}>
                                {r.user?.fullName ?? `User ID: ${r.userId}`}
                            </td>
                            <td style={tdStyle}>
                                {r.user?.email ?? "-"}
                            </td>
                            <td style={tdStyle}>
                                {r.resource?.name ?? `Resource ID: ${r.resourceId}`}
                            </td>
                            <td style={tdStyle}>{formatDate(r.startTime)}</td>
                            <td style={tdStyle}>{formatDate(r.endTime)}</td>
                            <td style={tdStyle}>
                                {r.status?.name ?? r.statusId}
                            </td>
                            <td style={tdStyle}>
                                <button
                                    onClick={() => handleApprove(r.id)}
                                    disabled={actionLoadingId === r.id || r.statusId === 2}
                                    style={{ marginRight: "8px" }}
                                >
                                    {actionLoadingId === r.id ? "..." : "Zatwierdź"}
                                </button>
                                <button
                                    onClick={() => handleReject(r.id)}
                                    disabled={actionLoadingId === r.id || r.statusId === 3}
                                >
                                    {actionLoadingId === r.id ? "..." : "Odrzuć"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const thStyle = {
    borderBottom: "1px solid #ccc",
    padding: "8px 12px",
    textAlign: "left",
};

const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "8px 12px",
};
