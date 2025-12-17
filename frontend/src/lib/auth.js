import { apiFetch, getToken, clearToken } from "./api.js";

export function requireAuth() {
    if (!getToken()) {
        window.location.href = "/login.html";
        return false;
    }
    return true;
}

export async function fetchCurrentUser() {
    return apiFetch("/auth/me");
}

export function logout() {
    clearToken();
    window.location.href = "/login.html";
}
