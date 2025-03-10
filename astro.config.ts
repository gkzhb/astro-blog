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
        title: "gkzhb's blog",
        description: "My personal blogs",
        author: "gkzhb",
        rss: true,
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
            {
              title: "Obsidian 知识花园",
              link: "https://blog.gkzhb.top/roam/",
              icon: "simple-icons:obsidian",
            },
            {
              title: "本网站由 “又拍云” 提供 CDN 加速/云存储服务",
              link: "https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral",
              icon: "simple-icons:rocket",
            },
            {
              title: "RSS",
              link: "/rss.xml",
              icon: "simple-icons:rss",
            },
          ],
        },
      },
    }),
    mdx(),
    react(),
  ],
});
