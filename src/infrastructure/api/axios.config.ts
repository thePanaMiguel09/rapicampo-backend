import axios, { AxiosInstance } from "axios";


export const createAuthServiceClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
        timeout: 5000,
        headers: {
            "Content-Type": "application/json"
        }
    });

    client.interceptors.request.use(
        (config) => {
            console.log(`[AuthService] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('[AuthService] Error:', error.message);
            return Promise.reject(error);
        }
    );

    return client;
}