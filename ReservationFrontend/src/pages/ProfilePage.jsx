import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../api/userApi";

export default function ProfilePage() {
    const auth = useAuth();
    const { user } = auth;
    const [form, setForm] = useState({
        email: "",
        fullName: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoadingInitial(false);
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setForm(prev => ({
                    ...prev,
                    email: data.email,
                    fullName: data.fullName,
                }));
            } catch (err) {
                console.error(err);
                setError("Failed to load profile data.");
            } finally {
                setLoadingInitial(false);
            }
        };

        fetchProfile();
    }, [user, navigate]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        const payload = {
            email: form.email,
            fullName: form.fullName,
            newPassword: form.newPassword || null,
        };

        try {
            setLoading(true);
            await updateMyProfile(payload);

            try {
                const fresh = await getMyProfile();
                setForm(prev => ({
                    ...prev,
                    email: fresh.email,
                    fullName: fresh.fullName,
                    newPassword: "",
                    confirmPassword: "",
                }));

                if (auth.setUser) {
                    auth.setUser(prev =>
                        prev ? { ...prev, email: fresh.email, fullName: fresh.fullName } : prev
                    );
                }
            } catch (refreshErr) {
                console.warn("Profile updated but failed to refresh:", refreshErr);
            }

            setSuccess("Profile updated successfully.");
        } catch (err) {
            console.error(err);
            const serverMsg = err.response?.data ?? err.message ?? String(err);
            setError(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
        } finally {
            setLoading(false);
        }
    }

    if (loadingInitial) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            <div className="reservation-card" style={{ maxWidth: 480, margin: "0 auto" }}>
                <h2 className="reservation-title" style={{ marginTop: 0 }}>My profile</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Email</label>
                        <br />
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Full name</label>
                        <br />
                        <input
                            name="fullName"
                            type="text"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                        />
                    </div>

                    <hr style={{ border: "none", height: 1, background: "#eef2f6", margin: "12px 0" }} />

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>New password (optional)</label>
                        <br />
                        <input
                            name="newPassword"
                            type="password"
                            value={form.newPassword}
                            onChange={handleChange}
                            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                        />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 600 }}>Confirm new password</label>
                        <br />
                        <input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Saving…" : "Save changes"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                getMyProfile().then(fresh => {
                                    setForm(prev => ({
                                        ...prev,
                                        email: fresh.email,
                                        fullName: fresh.fullName,
                                        newPassword: "",
                                        confirmPassword: "",
                                    }));
                                    setError("");
                                    setSuccess("");
                                }).catch(() => { });
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}