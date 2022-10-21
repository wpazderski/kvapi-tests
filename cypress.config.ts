import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "https://localhost:23501/",
    },
    screenshotOnRunFailure: false,
    video: false,
    defaultCommandTimeout: 10000,
});
