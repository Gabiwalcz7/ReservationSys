import axios from "axios";

const API_BASE_URL = "https://localhost:7224/api";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyProfile() {
    const res = await axios.get(`${API_BASE_URL}/User/me`, {
        headers: getAuthHeaders(),
    });
    return res.data;
}

export async function updateMyProfile(payload) {
    const res = await axios.put(`${API_BASE_URL}/User/me`, payload, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        validateStatus: (s) => s >= 200 && s < 500,
    });

    if (res.status >= 200 && res.status < 300) {
        return { status: res.status, data: res.data ?? null };
    }

    const serverMsg = res.data && typeof res.data === "string"
        ? res.data
        : res.data && res.data.message
            ? res.data.message
            : res.statusText || `HTTP ${res.status}`;

    const err = new Error(serverMsg);
    err.status = res.status;
    err.response = res;
    throw err;
}