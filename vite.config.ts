import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default () => {
  return defineConfig({
    plugins: [
      react(),
    ],
    server: {
      // https://proxyscrape.com/tools/random-port-generator
      port: 9525,
    },
    resolve: {
      alias: {
        "@": "./src",
      },
    },
    envPrefix: "APP_",
    envDir: "environments"
  });
};
