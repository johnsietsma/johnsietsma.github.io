import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://johnsietsma.com/",
    title: "John Sietsma",
    description: "Creative technologist and technical leader. Real-time 3D, 3D capture, machine learning.",
    author: "John Sietsma",
    profile: "https://johnsietsma.com",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Australia/Sydney",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/johnsietsma" },
    { name: "linkedin", url: "https://www.linkedin.com/in/jsietsma/" },
    { name: "mail",     url: "mailto:john@sietsma.com" },
  ],
  shareLinks: [
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
