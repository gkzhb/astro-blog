import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import charm from "astro-charm";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://blog.gkzhb.top/",
  output: "static",
  redirects: {
    // redirect old hugo url to new url
    "/post/[...slug]": "/posts/[...slug]",
  },
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
    mdx(),
    react(),
  ],
});

