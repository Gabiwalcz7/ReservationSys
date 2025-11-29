import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { getReservationsByUser } from "../api/reservationApi";

export default function MyReservationsPage() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.userId) {
            setError("Musisz być zalogowany, aby zobaczyć swoje rezerwacje.");
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
                setError("Nie udało się pobrać Twoich rezerwacji.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    if (loading) {
        return <p>Wczytywanie rezerwacji...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!reservations || reservations.length === 0) {
        return <p>Nie masz jeszcze żadnych rezerwacji.</p>;
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleString("pl-PL");
    }

    return (
        <div>
            <h2>Moje rezerwacje</h2>

            <table style={{ borderCollapse: "collapse", minWidth: "700px", marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Zasób</th>
                        <th style={thStyle}>Od</th>
                        <th style={thStyle}>Do</th>
                        <th style={thStyle}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((r) => (
                        <tr key={r.id}>
                            <td style={tdStyle}>
                                {r.resourceName ?? r.resource?.name ?? `ID: ${r.resourceId}`}
                            </td>
                            <td style={tdStyle}>{formatDate(r.startTime)}</td>
                            <td style={tdStyle}>{formatDate(r.endTime)}</td>
                            <td style={tdStyle}>
                                {r.statusName ?? r.status?.name ?? r.statusId ?? "-"}
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
