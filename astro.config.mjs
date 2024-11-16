import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { astroImageTools } from 'astro-imagetools';

// https://astro.build/config
export default defineConfig({
  site: "https://codepassion.co/",
  vite: {
    plugins: [
      {
        name: 'import.meta.url-transformer',
        transform: (code, id) => {
          if (id.endsWith('.astro'))
            return code.replace(/import.meta.url/g, `"${id}"`);
        },
      },
    ],
    ssr: {
      external: ['svgo'],
    },
  },
  integrations: [tailwind(), icon(), astroImageTools],
});
