import axios from "axios";

const API_URL = "https://localhost:7224/api/resources"; // ten sam host/port co Swagger

export async function getResources() {
    const token = localStorage.getItem("token");

    const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const response = await axios.get(API_URL, { headers });
    return response.data;
}
