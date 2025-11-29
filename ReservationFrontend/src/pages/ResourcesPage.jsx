import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResources } from "../api/resourcesApi";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadResources() {
            try {
                setLoading(true);
                setError("");
                const data = await getResources();
                setResources(data);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać listy zasobów.");
            } finally {
                setLoading(false);
            }
        }

        loadResources();
    }, []);

    function handleReserve(resourceId) {
        navigate(`/resources/${resourceId}/reserve`);
    }

    if (loading) {
        return (
            <div>
                <h2>Lista zasobów</h2>
                <p>Wczytywanie...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Lista zasobów</h2>
                <p style={{ color: "red" }}>{error}</p>
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div>
                <h2>Lista zasobów</h2>
                <p>Brak zasobów do wyświetlenia.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Lista zasobów</h2>

            <table style={{ borderCollapse: "collapse", minWidth: "600px", marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Nazwa</th>
                        <th style={thStyle}>Typ</th>
                        <th style={thStyle}>Pojemność</th>
                        <th style={thStyle}>Aktywny</th>
                        <th style={thStyle}></th>
                    </tr>
                </thead>
                <tbody>
                    {resources.map((r) => (
                        <tr key={r.id}>
                            <td style={tdStyle}>{r.name}</td>
                            <td style={tdStyle}>{r.resourceTypeName ?? r.resourceType?.name ?? "-"}</td>
                            <td style={tdStyle}>{r.capacity ?? "-"}</td>
                            <td style={tdStyle}>{r.isActive ? "Tak" : "Nie"}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleReserve(r.id)}>
                                    Zarezerwuj
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
