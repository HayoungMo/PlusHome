import axios from "axios";

export const API_BASE_URL = "/api";
export const IMAGE_BASE_URL = `${API_BASE_URL}/images`;

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-type": "application/json",
        "Content-Disposition": "application/json",
    },
    withCredentials: true,
});

export const fileHttp = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default http;
