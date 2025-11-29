/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import {
    getReservationById,
    updateUserReservation,
} from "../api/reservationApi";

export default function EditMyReservationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [resourceId, setResourceId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!user) {
        return <p>Musisz być zalogowany, aby edytować swoją rezerwację.</p>;
    }

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");
                const r = await getReservationById(id);

                if (r.userId !== user.userId && user.role !== "Admin") {
                    setError("Nie możesz edytować tej rezerwacji.");
                    return;
                }

                setResourceId(r.resourceId.toString());
                const start = new Date(r.startTime);
                const end = new Date(r.endTime);
                const toInput = (d) =>
                    d.toISOString().slice(0, 16);

                setStartTime(toInput(start));
                setEndTime(toInput(end));
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError("Ta rezerwacja nie istnieje.");
                } else {
                    setError("Nie udało się wczytać rezerwacji.");
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, user]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!resourceId || !startTime || !endTime) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        try {
            await updateUserReservation(
                id,
                parseInt(resourceId, 10),
                new Date(startTime).toISOString(),
                new Date(endTime).toISOString()
            );
            setSuccess("Rezerwacja została zaktualizowana.");
            setTimeout(() => {
                navigate("/my-reservations");
            }, 1000);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                setError("Wybrany czas koliduje z inną rezerwacją.");
            } else if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError("Nie udało się zaktualizować rezerwacji.");
            }
        }
    }

    if (loading) {
        return <p>Wczytywanie rezerwacji...</p>;
    }

    if (error && !success) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "340px", textAlign: "center" }}>
                <h2>Edytuj rezerwację</h2>

               

                <label style={{ display: "block", marginBottom: "6px" }}>
                    Od:
                </label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <label style={{ display: "block", marginBottom: "6px" }}>
                    Do:
                </label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Zapisz zmiany
                </button>
            </form>
        </div>
    );
}
