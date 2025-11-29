import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { getResources, deleteResource } from "../api/resourcesApi";

export default function ResourcesPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await getResources();
                setResources(data);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać zasobów.");
            }
        }
        load();
    }, []);

    async function handleDelete(id) {
        if (!window.confirm("Na pewno chcesz usunąć ten zasób?")) return;

        try {
            await deleteResource(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data ?? "Nie udało się usunąć zasobu.");
        }
    }

    return (
        <div>
            <h2>Zasoby</h2>

            {resources.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                    <strong>{r.name}</strong>{" "}
                    <span>({r.resourceType?.name ?? "-"})</span>

                    {user && (
                        <Link to={`/resources/${r.id}/reserve`} style={{ marginLeft: "1rem" }}>
                            Zarezerwuj
                        </Link>
                    )}

                    {user?.role === "Admin" && (
                        <>
                            <Link to={`/resources/${r.id}/edit`} style={{ marginLeft: "1rem" }}>
                                Edytuj
                            </Link>
                            <button
                                onClick={() => handleDelete(r.id)}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                Usuń
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
