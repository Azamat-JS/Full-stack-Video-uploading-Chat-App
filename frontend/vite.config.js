import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "login.html"),
                signup: resolve(__dirname, "signup.html"),
                chat: resolve(__dirname, "chat.html"),
                upload: resolve(__dirname, "upload.html"),
                videos: resolve(__dirname, "videos.html"),
            },
        },
    },
});
