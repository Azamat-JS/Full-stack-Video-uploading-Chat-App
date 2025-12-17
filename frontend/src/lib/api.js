export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const TOKEN_KEY = "token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
        clearToken();
        window.location.href = "/login.html";
        return;
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
