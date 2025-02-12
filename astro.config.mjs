// @ts-check
import { defineConfig } from 'astro/config';
import charm from "astro-charm";

// https://astro.build/config
export default defineConfig({
	integrations: [charm({
config: {
  "lang": "en",
  "title": "Title on home page",
  "description": "Description on home page",
  "author": "Your Name",
  "licenseId": "CC-BY-4.0",
  "side": {
    "title": "Title",
    "sub": "Sub title",
    "bio": "Your bio, about 50~90 characters, automatic line wrap",
    "navHome": {
      "title": "Home"
    },
    "footer": [
      {
        "title": "Twitter",
        "link": "https://x.com/",
        "icon": "simple-icons:twitter"
      },
      {
        "title": "GitHub",
        "link": "https://github.com/yuhanawa/astro-charm",
        "icon": "simple-icons:github"
      }
    ]
  }
}
})
],
});