import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { getResources, deleteResource } from "../api/resourcesApi";

export default function ResourcesPage() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getResources();
                setResources(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        try {
            await deleteResource(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data ?? "Failed to delete.");
        }
    }

    const filtered = resources.filter((r) => {
        if (!showInactive && r.isActive === false) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (
            (r.name ?? "").toString().toLowerCase().includes(q)
        );
    });

    if (loading) return <div className="container"><p>Loading...</p></div>;
    if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

    return (
        <div className="container">
            <h2>Items</h2>

            <div className="resources-controls">
                <input
                    className="resource-search"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    Show inactive
                </label>
            </div>

            <div className="resource-list">
                {filtered.length === 0 && <p className="resource-meta">There's no items to show.</p>}

                {filtered.map((r) => (
                    <article key={r.id} className="resource-item" aria-labelledby={`res-${r.id}`}>
                        <div className="resource-header">
                            <div id={`res-${r.id}`} className="resource-title">{r.name}</div>
                        </div>
                     
                        <div className="resource-meta">Status: {r.isActive ? "Active" : "Inactive"}</div>

                        <div className="resource-actions">
                            

                            {user ? (
                                <Link to={`/reserve/new?resourceId=${r.id}`} className="btn btn-primary">Book</Link>
                            ) : (
                                <Link to="/login" className="btn btn-primary">Log in to book</Link>
                            )}

                            {user?.role === "Admin" && (
                                <>
                                    <Link to={`/resources/${r.id}/edit`} className="btn btn-secondary">Edit</Link>
                                    <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                                </>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}