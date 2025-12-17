import { apiFetch } from "./lib/api.js";
import { initAuthedPage } from "./lib/ui.js";

const sessionsEl = document.getElementById("sessions");
const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const newChatBtn = document.getElementById("newChatBtn");
const emptyState = document.getElementById("chatEmptyState");

let sessions = [];
let activeSessionId = null;
let isSending = false;

function typeText(el, text) {
    const chars = Array.from(text);
    return new Promise((resolve) => {
        let i = 0;
        const step = () => {
            el.textContent = chars.slice(0, i).join("");
            messagesEl.scrollTop = messagesEl.scrollHeight;
            if (i < chars.length) {
                i += 1;
                setTimeout(step, 15);
            } else {
                resolve();
            }
        };
        step();
    });
}

async function loadSessions() {
    sessions = await apiFetch("/chat/sessions");
    renderSessions();
    if (!activeSessionId && sessions.length) {
        setActiveSession(sessions[0]._id);
    }
    if (!sessions.length) {
        await createSession("New chat");
    }
}

function renderSessions() {
    sessionsEl.innerHTML = sessions
        .map(
            (s) => `
        <button class="session ${s._id === activeSessionId ? "active" : ""}" data-id="${s._id}">
            <span>${s.title || "Chat"}</span>
        </button>
    `
        )
        .join("");
}

async function setActiveSession(id) {
    activeSessionId = id;
    renderSessions();
    await loadMessages(id);
}

async function loadMessages(id) {
    messagesEl.innerHTML = "";
    emptyState.style.display = "none";
    const messages = await apiFetch(`/chat/sessions/${id}/messages`);
    if (!messages.length) {
        emptyState.style.display = "flex";
        return;
    }

    messages.forEach((m) => {
        const bubble = document.createElement("div");
        bubble.className = `bubble ${m.role}`;
        bubble.innerHTML = `<p>${m.content}</p>`;
        messagesEl.appendChild(bubble);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function createSession(title) {
    const session = await apiFetch("/chat/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
    });
    sessions = [session, ...sessions];
    await setActiveSession(session._id);
}

async function sendMessage(content) {
    if (!activeSessionId || isSending) return;
    isSending = true;

    const userBubble = document.createElement("div");
    userBubble.className = "bubble user";
    userBubble.innerHTML = `<p>${content}</p>`;
    messagesEl.appendChild(userBubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    emptyState.style.display = "none";
    chatInput.value = "";
    chatInput.focus();

    try {
        const res = await apiFetch(`/chat/sessions/${activeSessionId}/messages`, {
            method: "POST",
            body: JSON.stringify({ content }),
        });
        const aiBubble = document.createElement("div");
        aiBubble.className = "bubble assistant";
        const p = document.createElement("p");
        aiBubble.appendChild(p);
        messagesEl.appendChild(aiBubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        await typeText(p, res.assistant.content || "");
    } finally {
        isSending = false;
    }
}

sessionsEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (id !== activeSessionId) {
        setActiveSession(id);
    }
});

chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = chatInput.value.trim();
    if (!content) return;
    await sendMessage(content);
});

newChatBtn?.addEventListener("click", () => createSession("New chat"));

initAuthedPage("chat").then(loadSessions);
