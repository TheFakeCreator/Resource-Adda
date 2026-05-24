import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id
                            .split("node_modules/")[1]
                            .split("/")[0]
                            .toString(); // This will create chunks for each dependency
                    }
                },
            },
        },
        outDir: "dist",
        emptyOutDir: true, // also necessary
    },
});
