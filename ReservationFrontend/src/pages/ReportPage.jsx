import { useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { getReservationReport } from "../api/reportApi";

export default function ReportPage() {
    const { user } = useAuth();

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!user || user.role !== "Admin") {
        return <p>Brak dostępu. Raport jest dostępny tylko dla administratora.</p>;
    }

    async function handleLoadReport(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await getReservationReport(
                fromDate || null,
                toDate || null
            );
            setRows(data);
        } catch (err) {
            console.error(err);
            setError("Nie udało się pobrać raportu.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>Raport rezerwacji</h2>

            <form onSubmit={handleLoadReport} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <label style={{ marginRight: "8px" }}>
                    Od:
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        style={{ marginLeft: "4px" }}
                    />
                </label>

                <label style={{ marginRight: "8px" }}>
                    Do:
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        style={{ marginLeft: "4px" }}
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Ładowanie..." : "Pobierz raport"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {rows.length === 0 && !loading && !error && (
                <p>Brak danych do wyświetlenia dla wybranego zakresu.</p>
            )}

            {rows.length > 0 && (
                <table style={{ borderCollapse: "collapse", minWidth: "700px", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Zasób</th>
                            <th style={thStyle}>Liczba rezerwacji</th>
                            <th style={thStyle}>Pending</th>
                            <th style={thStyle}>Approved</th>
                            <th style={thStyle}>Rejected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.resourceId}>
                                <td style={tdStyle}>{r.resourceName}</td>
                                <td style={tdStyle}>{r.totalReservations}</td>
                                <td style={tdStyle}>{r.pendingCount}</td>
                                <td style={tdStyle}>{r.approvedCount}</td>
                                <td style={tdStyle}>{r.rejectedCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
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
