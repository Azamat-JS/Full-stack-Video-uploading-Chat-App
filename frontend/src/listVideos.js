import { apiFetch } from "./lib/api.js";
import { initAuthedPage } from "./lib/ui.js";

const container = document.getElementById("videos");
const emptyState = document.getElementById("videosEmpty");

async function load() {
    const videos = await apiFetch("/videos");
    if (!videos.length) {
        emptyState.style.display = "block";
        container.innerHTML = "";
        return;
    }

    emptyState.style.display = "none";
    container.innerHTML = videos
        .map(
            (v) => `
    <article class="video-card">
      <div class="video-meta">
        <p class="eyebrow">${new Date(v.createdAt).toLocaleDateString()}</p>
        <h3>${v.title}</h3>
        <p>${v.description || ""}</p>
      </div>
      <video src="${v.url}" controls></video>
    </article>
  `
        )
        .join("");
}

initAuthedPage("videos").then(load);
