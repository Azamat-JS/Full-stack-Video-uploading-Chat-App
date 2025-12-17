import { fetchCurrentUser, requireAuth, logout } from "./auth.js";

export async function initAuthedPage(pageKey) {
    if (!requireAuth()) return null;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.onclick = logout;

    if (pageKey) {
        document.querySelectorAll("[data-nav]").forEach(link => {
            if (link.dataset.nav === pageKey) link.classList.add("active");
        });
    }

    try {
        const user = await fetchCurrentUser();
        const userEmail = document.getElementById("userEmail");
        if (userEmail && user?.email) userEmail.textContent = user.email;
        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
}
