import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { getAllReservations } from "../api/reservationApi";

export default function ReportPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    useEffect(() => {
        if (!user) return;
        if (user.role !== "Admin") {
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
                setError("Failed to load.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user, navigate]);

    function inRange(r) {
        if (!from && !to) return true;
        const start = new Date(r.startTime);
        if (from) {
            const f = new Date(from);
            if (start < f) return false;
        }
        if (to) {
            const t = new Date(to);
            if (start > t) return false;
        }
        return true;
    }

    const filtered = useMemo(() => reservations.filter(inRange), [reservations, from, to]);

    const stats = useMemo(() => {
        const s = { total: filtered.length, byStatus: {}, byResource: {}, byUser: {} };
        for (const r of filtered) {
            const status = r.statusName ?? r.status?.name ?? String(r.statusId ?? "Unknown");
            s.byStatus[status] = (s.byStatus[status] || 0) + 1;

            const resource = r.resourceName ?? r.resource?.name ?? `ID:${r.resourceId}`;
            s.byResource[resource] = (s.byResource[resource] || 0) + 1;

            const userKey = r.userName ?? r.user?.fullName ?? r.user?.email ?? `ID:${r.userId ?? "?"}`;
            s.byUser[userKey] = (s.byUser[userKey] || 0) + 1;
        }
        return s;
    }, [filtered]);

    function downloadCSV() {
        if (!filtered.length) return;
        const headers = [
            "Id",
            "Resource",
            "User",
            "StartTime",
            "EndTime",
            "Status",
        ];
        const rows = filtered.map(r => ([
            r.id,
            `"${(r.resourceName ?? r.resource?.name ?? "").replace(/"/g, '""')}"`,
            `"${(r.userName ?? r.user?.fullName ?? r.user?.email ?? "").replace(/"/g, '""')}"`,
            r.startTime,
            r.endTime,
            `"${(r.statusName ?? r.status?.name ?? "").replace(/"/g, '""')}"`
        ]));

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reservations_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

    return (
        <div className="container">
            <h2>Report</h2>

            <section style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                <label style={{ display: "flex", flexDirection: "column" }}>
                    From
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </label>

                <label style={{ display: "flex", flexDirection: "column" }}>
                    To
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </label>

                <button className="btn btn-secondary" onClick={() => { setFrom(""); setTo(""); }}>
                    Clear
                </button>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <div style={{ alignSelf: "center", fontWeight: 700 }}>All: {stats.total}</div>
                    <button className="btn btn-primary" onClick={downloadCSV} disabled={filtered.length === 0}>
                        Export to CSV
                    </button>
                </div>
            </section>

            <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                    <h3>Number of reservations:</h3>
                    <ul>
                        {Object.entries(stats.byResource).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => (
                            <li key={k}><strong>{k}</strong>: {v}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3>Statuses:</h3>
                    <ul>
                        {Object.entries(stats.byStatus).map(([k, v]) => (
                            <li key={k}>{k}: {v}</li>
                        ))}
                    </ul>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                    <h3>Details</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={th}>Id</th>
                                    <th style={th}>Item</th>
                                    <th style={th}>User</th>
                                    <th style={th}>From</th>
                                    <th style={th}>To</th>
                                    <th style={th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <td style={td}>{r.id}</td>
                                        <td style={td}>{r.resourceName ?? r.resource?.name ?? `ID:${r.resourceId}`}</td>
                                        <td style={td}>{r.userName ?? r.user?.fullName ?? r.user?.email ?? `ID:${r.userId ?? "?"}`}</td>
                                        <td style={td}>{new Date(r.startTime).toLocaleString("pl-PL")}</td>
                                        <td style={td}>{new Date(r.endTime).toLocaleString("pl-PL")}</td>
                                        <td style={td}>{r.statusName ?? r.status?.name ?? r.statusId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

const th = { borderBottom: "1px solid #ddd", textAlign: "left", padding: "8px 10px" };
const td = { borderBottom: "1px solid #f1f1f1", padding: "8px 10px", verticalAlign: "top" };