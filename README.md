# johnsietsma.com

Personal site: blog (Gaussian splatting, photogrammetry, graphics), portfolio, about.

Built with [Astro](https://astro.build) on the [AstroPaper](https://github.com/satnaing/astro-paper) theme (MIT).
Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Develop

    npm install
    npm run dev      # local preview at localhost:4321
    npm run build    # type check + build + search index

## Layout

- `src/content/posts/` - blog posts (markdown)
- `src/content/portfolio/` - project pages
- `src/content/pages/` - about, speaking
- `public/assets/` - images, legacy three.js runtime for 2015-16 posts
- `astro-paper.config.ts` - site config (title, socials, features)

Old Jekyll post URLs (`/YYYY/MM/DD/slug/`) redirect to `/posts/slug/` via
`redirects` in `astro.config.ts`.
