import axios from "axios";

const API_URL = "https://localhost:7224/api/Reservation";

export async function createReservation(resourceId, userId, startTime, endTime) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        resourceId,
        userId,
        startTime,
        endTime,
    };

    console.log("Wysyłam rezerwację:", body, "nagłówki:", headers);

    const response = await axios.post(API_URL, body, { headers });
    return response.data;
}

export async function getReservationsByUser(userId) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(`${API_URL}/user/${userId}`, { headers });
    return response.data;
}

export async function getAllReservations() {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(API_URL, { headers });
    return response.data;
}

export async function approveReservation(id, adminId, comment) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        adminId,
        comment
    };

    const response = await axios.put(`${API_URL}/approve/${id}`, body, { headers });
    return response.data;
}

export async function rejectReservation(id, adminId, comment) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        adminId,
        comment
    };

    const response = await axios.put(`${API_URL}/reject/${id}`, body, { headers });
    return response.data;
}
