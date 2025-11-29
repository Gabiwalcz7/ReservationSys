import axios from "axios";

const API_URL = "https://localhost:7224/api/Reports/reservations";

export async function getReservationReport(fromDate, toDate) {
    const token = localStorage.getItem("token");

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const params = {};
    if (fromDate) params.from = fromDate; 
    if (toDate) params.to = toDate;

    const response = await axios.get(API_URL, { headers, params });
    return response.data;
}
