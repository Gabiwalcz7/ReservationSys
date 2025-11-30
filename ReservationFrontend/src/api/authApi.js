import axios from "axios";

const AUTH_URL = "https://localhost:7224/api/Auth";

export async function login(email, password) {
    const body = { email, password };
    const res = await axios.post(`${AUTH_URL}/login`, body);
    return res.data;
}

export async function register(fullName, email, password) {
    const body = { fullName, email, password };
    const res = await axios.post(`${AUTH_URL}/register`, body);
    return res.data;
}