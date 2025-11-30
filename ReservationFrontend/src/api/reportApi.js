import axios from "axios";

const BASE = "https://localhost:7224/api/Reports";

export async function getReservationReport(fromDate, toDate) {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = {};
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    const res = await axios.get(`${BASE}/reservations`, { headers, params });
    return res.data;
}

export async function getReservationDetails(resourceId, fromDate, toDate) {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = {};
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    const res = await axios.get(`${BASE}/reservations/${resourceId}/details`, { headers, params });
    return res.data;
}
