import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { getResources } from "../api/resourcesApi";
import { createReservation } from "../api/reservationApi";

export default function CreateReservationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { search } = useLocation();

    const params = new URLSearchParams(search);
    const initialResourceId = params.get("resourceId") ?? "";

    const [resources, setResources] = useState([]);
    const [resourceId, setResourceId] = useState(initialResourceId);
    const [resourceName, setResourceName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getResources();
                const list = Array.isArray(data) ? data : [];
                setResources(list);

                if (initialResourceId) {
                    const found = list.find(r => String(r.id) === String(initialResourceId));
                    setResourceName(found ? `${found.name}${found.location ? ` — ${found.location}` : ""}` : "");
                    setResourceId(found ? String(found.id) : initialResourceId);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [initialResourceId]);

    if (!user) {
        return <div className="container"><p>You have to be logged in.</p></div>;
    }

    function validateDates(start, end) {
        const s = new Date(start);
        const e = new Date(end);
        if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "Wrong date.";
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!resourceId) {
            setError("Chose item.");
            return;
        }
        if (!startTime || !endTime) {
            setError("Dates are required.");
            return;
        }
        const dateErr = validateDates(startTime, endTime);
        if (dateErr) {
            setError(dateErr);
            return;
        }

        try {
            setSaving(true);
            await createReservation(
                parseInt(resourceId, 10),
                user.userId,
                new Date(startTime).toISOString(),
                new Date(endTime).toISOString()
            );
            setSuccess("Reservation created.");
            setTimeout(() => navigate("/my-reservations"), 900);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                setError("The selected time conflicts with another reservation.");
            } else if (err.response?.data) {
                setError(typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data));
            } else {
                setError("Failed to create.");
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container" style={{ maxWidth: 720 }}>
            <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 12 }}>
                <h2>New reservation</h2>

                {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
                {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}

                <label style={{ display: "block", marginBottom: 6 }}>Item</label>

                {initialResourceId ? (
                    <input
                        type="text"
                        value={resourceName || `ID: ${initialResourceId}`}
                        disabled
                        aria-readonly
                        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10, background: "#f5f7fa" }}
                    />
                ) : (
                    <select
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                    >
                        <option value="">-- none --</option>
                        {resources.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}{r.location ? ` — ${r.location}` : ""}
                            </option>
                        ))}
                    </select>
                )}

                <label style={{ display: "block", marginBottom: 6 }}>From</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />

                <label style={{ display: "block", marginBottom: 6 }}>To</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />                

                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Creating..." : "Book"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}