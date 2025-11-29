import React, { useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { getReservationReport, getReservationDetails } from "../api/reportApi";

const thStyle = { borderBottom: "1px solid #ccc", padding: "8px 12px", textAlign: "left" };
const tdStyle = { borderBottom: "1px solid #eee", padding: "8px 12px" };

export default function ReportPage() {
    const { user } = useAuth();

    // filtry i dane zagregowane
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // drill-down
    const [expandedId, setExpandedId] = useState(null);
    const [details, setDetails] = useState({});      // cache: { [resourceId]: array }
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    if (!user || user.role !== "Admin") {
        return <p>Brak dostępu. Raport dostępny tylko dla administratora.</p>;
    }

    async function handleLoadReport(e) {
        e?.preventDefault?.();
        setError("");
        setLoading(true);
        try {
            const data = await getReservationReport(fromDate || null, toDate || null);
            setRows(data);
            // zmiana zakresu = czyścimy szczegóły, żeby były zgodne z filtrami
            setExpandedId(null);
            setDetails({});
            setDetailsError("");
        } catch (err) {
            console.error(err);
            setError("Nie udało się pobrać raportu.");
        } finally {
            setLoading(false);
        }
    }

    async function toggleDetails(resourceId) {
        // zwijanie
        if (expandedId === resourceId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(resourceId);
        setDetailsError("");

        // jeśli mamy w cache -> nie ładuj ponownie
        if (details[resourceId]) return;

        try {
            setDetailsLoading(true);
            const list = await getReservationDetails(resourceId, fromDate || null, toDate || null);
            setDetails(prev => ({ ...prev, [resourceId]: list }));
        } catch (err) {
            console.error(err);
            setDetailsError("Nie udało się pobrać szczegółów.");
        } finally {
            setDetailsLoading(false);
        }
    }

    function formatDate(d) {
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return d;
        return x.toLocaleString("pl-PL");
    }

    function exportToCsv(filename, rows) {
        if (!rows || rows.length === 0) return;

        const headers = Object.keys(rows[0]);

        const escape = (v) => {
            if (v == null) return "";
            const s = String(v);
            if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };

        const csv = [
            headers.join(";"),
            ...rows.map(r => headers.map(h => escape(r[h])).join(";"))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            <h2>Raport rezerwacji</h2>

            {/* Filtry */}
            <form onSubmit={handleLoadReport} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <label style={{ marginRight: 8 }}>
                    Od:
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        style={{ marginLeft: 4 }}
                    />
                </label>
                <label style={{ marginRight: 8 }}>
                    Do:
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        style={{ marginLeft: 4 }}
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? "Ładowanie..." : "Pobierz raport"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && rows.length === 0 && !error && <p>Brak danych do wyświetlenia.</p>}

            {rows.length > 0 && (
                <table style={{ borderCollapse: "collapse", minWidth: 900, marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Zasób</th>
                            <th style={thStyle}>Liczba</th>
                            <th style={thStyle}>Pending</th>
                            <th style={thStyle}>Approved</th>
                            <th style={thStyle}>Rejected</th>
                            <th style={thStyle}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <React.Fragment key={r.resourceId}>
                                <tr>
                                    <td style={tdStyle}>{r.resourceName}</td>
                                    <td style={tdStyle}>{r.totalReservations}</td>
                                    <td style={tdStyle}>{r.pendingCount}</td>
                                    <td style={tdStyle}>{r.approvedCount}</td>
                                    <td style={tdStyle}>{r.rejectedCount}</td>
                                    <td style={tdStyle}>
                                        <button onClick={() => toggleDetails(r.resourceId)}>
                                            {expandedId === r.resourceId ? "Ukryj" : "Pokaż"} szczegóły
                                        </button>
                                    </td>
                                </tr>

                                {expandedId === r.resourceId && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: "10px 12px" }}>
                                            {detailsLoading && <p>Ładowanie szczegółów...</p>}
                                            {detailsError && <p style={{ color: "red" }}>{detailsError}</p>}

                                            {!detailsLoading && !detailsError && (
                                                <>
                                                    {!details[r.resourceId] || details[r.resourceId].length === 0 ? (
                                                        <p>Brak rezerwacji w tym zakresie.</p>
                                                    ) : (
                                                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={thStyle}>ID</th>
                                                                    <th style={thStyle}>Użytkownik</th>
                                                                    <th style={thStyle}>Email</th>
                                                                    <th style={thStyle}>Od</th>
                                                                    <th style={thStyle}>Do</th>
                                                                    <th style={thStyle}>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {details[r.resourceId].map(d => (
                                                                    <tr key={d.id}>
                                                                        <td style={tdStyle}>{d.id}</td>
                                                                        <td style={tdStyle}>{d.userName ?? d.userId}</td>
                                                                        <td style={tdStyle}>{d.userEmail ?? "-"}</td>
                                                                        <td style={tdStyle}>{formatDate(d.startTime)}</td>
                                                                        <td style={tdStyle}>{formatDate(d.endTime)}</td>
                                                                        <td style={tdStyle}>{d.statusName ?? d.statusId}</td>
                                                                    </tr>
                                                                ))}
                                                                    {expandedId === r.resourceId && details[r.resourceId]?.length > 0 && (
                                                                        <button
                                                                            style={{ marginLeft: 8 }}
                                                                            onClick={() => exportToCsv(
                                                                                `rezerwacje_resource_${r.resourceId}.csv`,
                                                                                details[r.resourceId].map(d => ({
                                                                                    Id: d.id,
                                                                                    ResourceId: d.resourceId,
                                                                                    ResourceName: d.resourceName,
                                                                                    UserId: d.userId,
                                                                                    UserName: d.userName,
                                                                                    UserEmail: d.userEmail,
                                                                                    StartTime: d.startTime,
                                                                                    EndTime: d.endTime,
                                                                                    StatusId: d.statusId,
                                                                                    StatusName: d.statusName
                                                                                }))
                                                                            )}
                                                                        >
                                                                            Eksport CSV (szczegóły)
                                                                        </button>
                                                                    )}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
            <button
                type="button"
                onClick={() => exportToCsv(
                    `raport_rezerwacji_${(new Date()).toISOString().slice(0, 10)}.csv`,
                    rows.map(r => ({
                        ResourceId: r.resourceId,
                        ResourceName: r.resourceName,
                        Total: r.totalReservations,
                        Pending: r.pendingCount,
                        Approved: r.approvedCount,
                        Rejected: r.rejectedCount
                    }))
                )}
                disabled={!rows?.length}
            >
                Eksport CSV (agregat)
            </button>
        </div>
    );
}
