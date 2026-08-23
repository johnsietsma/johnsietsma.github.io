import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  redirects: {
    "/2015/11/30/threejs/": "/posts/threejs/",
    "/2015/12/01/flow-maps/": "/posts/flow-maps/",
    "/2016/04/13/fluid-flow-shadertoy/": "/posts/fluid-flow-shadertoy/",
    "/2016/04/14/fluids-threejs/": "/posts/fluids-threejs/",
    "/2019/11/29/infinite-points-introduction/": "/posts/infinite-points-introduction/",
    "/2019/12/05/morton-order-introduction/": "/posts/morton-order-introduction/",
    "/2019/12/13/mordon-burst/": "/posts/mordon-burst/",
    "/2020/01/02/native-sparse-array/": "/posts/native-sparse-array/",
    "/2020/01/20/text-generation-for-jobs/": "/posts/text-generation-for-jobs/",
    "/2020/02/07/nativeint/": "/posts/nativeint/",
    "/2020/07/20/physical-camera-component/": "/posts/physical-camera-component/",
    "/blog/": "/posts/",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
