import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://codepassion.co/",
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
  integrations: [tailwind(), react(), icon()],
});
