import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import {
    getResourceById,
    updateResource,
    deleteResource,
    getResourceTypes,
} from "../api/resourcesApi";

export default function EditResourcePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [resourceTypeId, setResourceTypeId] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || user.role !== "Admin") {
            navigate("/");
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError("");

                const [res, t] = await Promise.all([
                    getResourceById(id),
                    getResourceTypes(),
                ]);

                setName(res.name ?? "");
                setResourceTypeId(res.resourceTypeId ?? "");
                setIsActive(res.isActive ?? true);

                setTypes(Array.isArray(t) ? t : []);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 404) {
                    setError("Item doesnt exist.");
                } else {
                    setError("Failed to load.");
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, user, navigate]);

    async function handleSave(e) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        try {
            setSaving(true);
            await updateResource(
                id,
                name.trim(),               
                resourceTypeId ? parseInt(resourceTypeId, 10) : null,
                !!isActive
            );
            navigate("/resources");
        } catch (err) {
            console.error(err);
            setError(err.response?.data ?? "Failed to save.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            await deleteResource(id);
            navigate("/resources");
        } catch (err) {
            console.error(err);
            alert(err.response?.data ?? "Failed to delete.");
        }
    }

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

    return (
        <div className="container" style={{ maxWidth: 760 }}>
            <form onSubmit={handleSave} style={{ marginTop: 12 }}>
                <h2>Edit item</h2>

                <label style={{ display: "block", marginBottom: 6 }}>Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                />

                <label style={{ display: "block", marginBottom: 6 }}>Type</label>
                <select
                    value={resourceTypeId}
                    onChange={(e) => setResourceTypeId(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd", marginBottom: 10 }}
                >
                    <option value="">-- none --</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </button>

                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/resources")}>
                        Cancel
                    </button>

                    <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ marginLeft: "auto" }}>
                        Delete
                    </button>
                </div>
            </form>
        </div>
    );
}