import axios from "axios";

const API_URL = `${window.location.origin}/api/Reservation`;

export async function getAllReservations() {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(API_URL, { headers });
    return res.data;
}

export async function approveReservation(id, adminId) {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { adminId };
    const res = await axios.put(`${API_URL}/approve/${id}`, body, { headers });
    return res.data;
}

export async function rejectReservation(id, adminId) {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { adminId };
    const res = await axios.put(`${API_URL}/reject/${id}`, body, { headers });
    return res.data;
}

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

export async function getReservationById(id) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(`${API_URL}/${id}`, { headers });
    return response.data;
}

export async function updateUserReservation(id, resourceId, startTime, endTime) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        resourceId,
        startTime,
        endTime,
    };

    const response = await axios.put(`${API_URL}/user/${id}`, body, { headers });
    return response.data;
}

export async function deleteUserReservation(id) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.delete(`${API_URL}/user/${id}`, { headers });
    return response.data;
}
