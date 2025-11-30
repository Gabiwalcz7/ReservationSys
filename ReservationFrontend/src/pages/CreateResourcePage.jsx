import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { createResource, getResourceTypes } from "../api/resourcesApi";

export default function CreateResourcePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [resourceTypeId, setResourceTypeId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [resourceTypes, setResourceTypes] = useState([]);
    const [typesError, setTypesError] = useState("");

    useEffect(() => {
        if (!user || user.role !== "Admin") return;

        async function loadTypes() {
            try {
                setTypesError("");
                const data = await getResourceTypes();
                setResourceTypes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setTypesError("Failed to load.");
            }
        }

        loadTypes();
    }, [user]);

    if (user.role !== "Admin") {
        return <p>You don't have access'.</p>;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !resourceTypeId) {
            setError("Name and type are required.");
            return;
        }

        try {
            await createResource(
                name,
                parseInt(resourceTypeId, 10),
                isActive
            );
            setSuccess("Succesfully added.");
            setTimeout(() => {
                navigate("/resources");
            }, 800);
        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                setError(err.response.data);
            } else {
                setError("Failed to add.");
            }
        }
    }

    return (
        <div className="container" style={{ maxWidth: 640 }}>
            <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 12 }}>
                <h2>Add item</h2>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />

                {typesError && <p style={{ color: "red" }}>{typesError}</p>}

                <select
                    value={resourceTypeId}
                    onChange={e => setResourceTypeId(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                >
                    <option value="">-- select type --</option>
                    {resourceTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                    />
                    Active
                </label>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 6 }}>
                    Save
                </button>
            </form>
        </div>
    );
}