import axios from "axios";

const API_URL = "https://localhost:7224/api/auth"; 

export async function login(email, password) {
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
    });
    return response.data;
}

export async function register(fullName, email, password) {
    const response = await axios.post(`${API_URL}/register`, {
        fullName,
        email,
        password,
    });
    return response.data;
}