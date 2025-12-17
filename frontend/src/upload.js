import { upload } from "@imagekit/javascript";
import { apiFetch } from "./lib/api.js";
import { initAuthedPage } from "./lib/ui.js";

const drop = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const fileTrigger = document.getElementById("fileTrigger");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const btn = document.getElementById("uploadBtn");
const statusEl = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

let selectedFile = null;
let isUploading = false;

function setStatus(s) { statusEl.textContent = s; }

initAuthedPage("upload");

function pickFile(file) {
    if (!file) return;
    if (!file.type.startsWith("video/")) return setStatus("Please choose a video file.");
    selectedFile = file;
    setStatus(`Selected: ${file.name} (${Math.round(file.size / 1024 / 1024)} MB)`);
}

drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("hover"); });
drop.addEventListener("dragleave", () => drop.classList.remove("hover"));
drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hover");
    pickFile(e.dataTransfer.files?.[0]);
});

fileInput.addEventListener("change", (e) => pickFile(e.target.files?.[0]));
fileTrigger?.addEventListener("click", () => fileInput.click());

btn.addEventListener("click", async () => {
    if (isUploading) return;
    if (!selectedFile) return setStatus("Pick a file first.");
    if (!titleEl.value.trim()) return setStatus("Title is required.");

    isUploading = true;
    btn.disabled = true;
    progressBar.style.width = "0%";

    setStatus("Fetching ImageKit auth params...");
    try {
        const { token, expire, signature } = await apiFetch("/imagekit/auth");

        setStatus("Uploading to ImageKit...");
        const resp = await upload({
            file: selectedFile,
            fileName: selectedFile.name,
            publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
            token,
            expire,
            signature,
            folder: "/videos",
            onProgress: (ev) => {
                const pct = ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0;
                progressBar.style.width = `${pct}%`;
                setStatus(`Uploading... ${pct}%`);
            },
        });

        setStatus("Saving metadata...");
        await apiFetch("/videos", {
            method: "POST",
            body: JSON.stringify({
                title: titleEl.value.trim(),
                description: descEl.value.trim(),
                fileId: resp.fileId,
                url: resp.url,
                name: resp.name,
                mime: selectedFile.type,
                size: selectedFile.size,
            }),
        });

        progressBar.style.width = "100%";
        setStatus("Done. Video saved.");
    } catch (err) {
        console.error(err);
        setStatus(err?.message || "Upload failed.");
    } finally {
        isUploading = false;
        btn.disabled = false;
    }
});
