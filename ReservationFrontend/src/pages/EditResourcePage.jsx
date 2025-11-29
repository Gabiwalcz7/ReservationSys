/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import {
    getResourceById,
    getResourceTypes,
    updateResource,
} from "../api/resourcesApi";

export default function EditResourcePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // id zasobu z URL

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [resourceTypeId, setResourceTypeId] = useState("");
    const [capacity, setCapacity] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [resourceTypes, setResourceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typesError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!user || user.role !== "Admin") {
        return <p>Brak dostępu. Edycja zasobów jest dostępna tylko dla administratora.</p>;
    }

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");

                const [types, resource] = await Promise.all([
                    getResourceTypes(),
                    getResourceById(id),
                ]);

                setResourceTypes(types);

                setName(resource.name || "");
                setDescription(resource.description || "");
                setResourceTypeId(resource.resourceTypeId?.toString() || "");
                setCapacity(resource.capacity != null ? resource.capacity.toString() : "");
                setIsActive(resource.isActive ?? true);
            } catch (err) {
                console.error(err);
                setError("Nie udało się wczytać danych zasobu.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !resourceTypeId) {
            setError("Nazwa i typ zasobu są wymagane.");
            return;
        }

        try {
            await updateResource(
                id,
                name,
                description || null,
                parseInt(resourceTypeId, 10),
                capacity ? parseInt(capacity, 10) : null,
                isActive
            );
            setSuccess("Zasób został zaktualizowany.");
            setTimeout(() => {
                navigate("/resources");
            }, 1000);
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError("Nie udało się zaktualizować zasobu.");
            }
        }
    }

    if (loading) {
        return <p>Wczytywanie danych zasobu...</p>;
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "340px", textAlign: "center" }}>
                <h2>Edytuj zasób</h2>

                <input
                    type="text"
                    placeholder="Nazwa zasobu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                />

             
                {typesError && <p style={{ color: "red" }}>{typesError}</p>}

                <select
                    value={resourceTypeId}
                    onChange={e => setResourceTypeId(e.target.value)}
                    required
                    style={{ width: "100%", marginBottom: "10px" }}
                >
                    <option value="">-- wybierz typ zasobu --</option>
                    {resourceTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

               

                <label style={{ display: "block", marginBottom: "10px" }}>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        style={{ marginRight: "6px" }}
                    />
                    Aktywny
                </label>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Zapisz zmiany
                </button>
            </form>
        </div>
    );
}
