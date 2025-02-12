import { defineConfig } from "astro/config";
import charm from "astro-charm";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://blog.gkzhb.top/",
  output: "static",
  integrations: [
    charm({
      config: {
        lang: "en",
        title: "Title on home page",
        description: "Description on home page",
        author: "gkzhb",
        licenseId: "CC-BY-4.0",
        side: {
          title: "gkzhb's blog",
          sub: "",
          bio: "Always believe that something wonderful is about to happen.",
          navHome: {
            title: "Home",
          },
          footer: [
            {
              title: "GitHub",
              link: "https://github.com/gkzhb",
              icon: "simple-icons:github",
            },
          ],
        },
      },
    }),
  ],
});

