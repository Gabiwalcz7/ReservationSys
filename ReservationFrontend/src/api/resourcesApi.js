import axios from "axios";

const API_URL = "/api/Resources";

export async function getResources() {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(API_URL, { headers });
    return response.data;
}

export async function createResource(name, resourceTypeId, isActive) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        name,
        isActive,
        resourceTypeId
    };

    const response = await axios.post(API_URL, body, { headers });
    return response.data;
}

export async function getResourceTypes() {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get("/api/ResourceTypes", { headers });
    return response.data;
}

export async function getResourceById(id) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(`${API_URL}/${id}`, { headers });
    return response.data;
}

export async function updateResource(id, name, resourceTypeId, isActive) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        name,
        isActive,
        resourceTypeId
    };

    const response = await axios.put(`${API_URL}/${id}`, body, { headers });
    return response.data;
}

export async function deleteResource(id) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.delete(`${API_URL}/${id}`, { headers });
    return response.data;
}
