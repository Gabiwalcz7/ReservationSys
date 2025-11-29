import axios from "axios";

const API_URL = "https://localhost:7224/api/Resources";

export async function getResources() {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(API_URL, { headers });
    return response.data;
}

export async function createResource(name, description, resourceTypeId, capacity, isActive) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        name,
        description,
        capacity: capacity || null,
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

    const response = await axios.get("https://localhost:7224/api/ResourceTypes", { headers });
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

export async function updateResource(id, name, description, resourceTypeId, capacity, isActive) {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const body = {
        name,
        description,
        capacity: capacity || null,
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
