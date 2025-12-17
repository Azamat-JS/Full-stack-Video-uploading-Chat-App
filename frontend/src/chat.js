import { apiFetch } from "./lib/api.js";

const messagesEl = document.getElementById("messages");
const input = document.getElementById("chatInput");
const btn = document.getElementById("sendBtn");

let sessionId = null;

async function init() {
    const session = await apiFetch("/chat/sessions", { method: "POST" });
    sessionId = session._id;
}

btn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;

    messagesEl.innerHTML += `<div><b>You:</b> ${text}</div>`;
    input.value = "";

    const res = await apiFetch(`/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: text }),
    });

    messagesEl.innerHTML += `<div><b>AI:</b> ${res.assistant.content}</div>`;
};

init();
