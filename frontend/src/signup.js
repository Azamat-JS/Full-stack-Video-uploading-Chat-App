import { API_BASE, getToken, setToken } from "./lib/api.js";

const form = document.getElementById("authForm");
const messageEl = document.getElementById("authMessage");

if (getToken()) {
    window.location.href = "/index.html";
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    messageEl.textContent = "";

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            let msg = "Unable to sign up.";
            try {
                const data = await res.json();
                msg = data?.message || msg;
            } catch {
                const text = await res.text();
                msg = text || msg;
            }
            throw new Error(msg);
        }
        const data = await res.json();
        setToken(data.token);
        window.location.href = "/index.html";
    } catch (err) {
        messageEl.textContent = err.message || "Unable to sign up.";
    }
});
