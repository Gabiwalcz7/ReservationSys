import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReservation } from "../api/reservationApi";
import { useAuth } from "../hooks/AuthProvider";

export default function NewReservationPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // resourceId z URLe();
    const { user } = useAuth();

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!user) {
        return <p>Musisz być zalogowana/zalogowany, aby tworzyć rezerwacje.</p>;
    }

    const resourceId = parseInt(id, 10);
    const userId = user.userId;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!date || !startTime || !endTime) {
            setError("Wypełnij wszystkie pola.");
            return;
        }

        const startIso = `${date}T${startTime}:00`;
        const endIso = `${date}T${endTime}:00`;

        if (endIso <= startIso) {
            setError("Godzina zakończenia musi być późniejsza niż rozpoczęcia.");
            return;
        }

        try {
            await createReservation(resourceId, userId, startIso, endIso);
            setSuccess("Rezerwacja została utworzona.");
            setTimeout(() => {
                navigate("/my-reservations");
            }, 1000);
        } catch (err) {
            console.error("Błąd przy tworzeniu rezerwacji:", err);

            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;

                let backendMessage = "";

                if (typeof data === "string") {
                    backendMessage = data;
                } else if (data?.title) {
                    backendMessage = data.title;
                } else if (data?.message) {
                    backendMessage = data.message;
                }

                setError(
                    `Błąd ${status}: ${backendMessage || "Nie udało się utworzyć rezerwacji."}`
                );
            } else {
                setError("Nie udało się połączyć z serwerem (brak odpowiedzi).");
            }
        }
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "320px", textAlign: "center" }}>
                <h2>Nowa rezerwacja</h2>
                <p>Resource ID: {resourceId}</p>

                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Zarezerwuj
                </button>
            </form>
        </div>
    );
}
