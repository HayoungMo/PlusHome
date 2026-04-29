import axios from "axios";

const baseURL = "http://localhost:8080/api";
// const baseURL = 'http://192.168.0.82:8080/api';

const http = axios.create({
	baseURL: baseURL,

	headers: {
		"Content-type": "application/json",
		"Content-Disposition": "application/json",
	},
	withCredentials: true,
});

export const fileHttp = axios.create({
	baseURL: baseURL,
	withCredentials: true,
});

export default http;
