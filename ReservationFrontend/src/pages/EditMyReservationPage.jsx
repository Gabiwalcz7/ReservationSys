import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { getReservationById, updateUserReservation} from "../api/reservationApi";

export default function EditMyReservationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [resourceId, setResourceId] = useState("");
    const [resourceName, setResourceName] = useState("");

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const toInputValue = (value) => {
        if (!value) return "";
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 16);
    };


    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError("");
                const r = await getReservationById(id);

                if (r.userId !== user.userId && user.role !== "Admin") {
                    setError("You cant edit this reservation.");
                    return;
                }

                setResourceId(String(r.resourceId));
                setResourceName(r.resourceName ?? r.resource?.name ?? `ID: ${r.resourceId}`);

                setStartTime(toInputValue(r.startTime));
                setEndTime(toInputValue(r.endTime));

                console.log("reservation from API", r);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError("It doesnt exist.");
                } else {
                    setError("Failed to load reservation.");
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, user]);

    if (!user) {
        return <p>Log in first</p>;
    }

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!resourceId || !startTime || !endTime) {
            setError("All fields are required.");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setError("Wrong data.");
            return;
        }
        if (end <= start) {
            setError("Wrong end time.");
            return;
        }

        try {
            setSaving(true);
            await updateUserReservation(
                id,
                parseInt(resourceId, 10),
                start.toISOString(),
                end.toISOString()
            );
            setSuccess("Updated.");
            setTimeout(() => navigate("/my-reservations"), 900);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                setError("The selected time conflicts with another reservation.");
            } else if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError("Failed to update.");
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    return (
        <div className="container" style={{ maxWidth: 720 }}>
            <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 12 }}>
                <h2>Edit reservation</h2>

                {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
                {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}

                <label style={{ display: "block", marginBottom: 6 }}>Item</label>
                <input
                    type="text"
                    value={resourceName}
                    disabled
                    aria-readonly
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10, background: "#f5f7fa" }}
                />

                <label style={{ display: "block", marginBottom: 6 }}>
                    From:
                </label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />

                <label style={{ display: "block", marginBottom: 6 }}>
                    To:
                </label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />

                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/my-reservations")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}