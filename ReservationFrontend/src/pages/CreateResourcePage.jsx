import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { createResource, getResourceTypes } from "../api/resourcesApi";

export default function CreateResourcePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description] = useState("");
    const [resourceTypeId, setResourceTypeId] = useState("");
    const [capacity] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [resourceTypes, setResourceTypes] = useState([]);
    const [typesError, setTypesError] = useState("");

    if (!user || user.role !== "Admin") {
        return <p>Brak dostępu. Dodawanie zasobów jest dostępne tylko dla administratora.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        async function loadTypes() {
            try {
                setTypesError("");
                const data = await getResourceTypes();
                setResourceTypes(data);
            } catch (err) {
                console.error(err);
                setTypesError("Nie udało się pobrać typów zasobów.");
            }
        }

        loadTypes();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !resourceTypeId) {
            setError("Nazwa i typ zasobu są wymagane.");
            return;
        }

        try {
            await createResource(
                name,
                description || null,
                parseInt(resourceTypeId, 10),
                capacity ? parseInt(capacity, 10) : null,
                isActive
            );
            setSuccess("Zasób został dodany.");
            setTimeout(() => {
                navigate("/resources");
            }, 1000);
        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError("Nie udało się dodać zasobu.");
            }
        }
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit} style={{ width: "340px", textAlign: "center" }}>
                <h2>Dodaj zasób</h2>

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
                    Zapisz
                </button>
            </form>
        </div>
    );
}
