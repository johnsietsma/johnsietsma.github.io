# johnsietsma.com

Personal site: blog and notes (Gaussian splatting, photogrammetry, graphics), portfolio, about.

Built with [Astro](https://astro.build) on the [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) theme (MIT).
Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Develop

    npm install
    npm run dev      # local preview at localhost:4321
    npm run build

## Layout

- `content/posts/` - blog posts (markdown)
- `content/notes/` - short-form notes
- `content/portfolio/` - project pages
- `src/prose/` - about and speaking page content
- `public/assets/` - images, legacy three.js runtime for the 2015-16 posts
- `src/site.config.ts` - site config (title, nav, socials)

Old Jekyll post URLs (`/YYYY/MM/DD/slug/`) redirect to `/posts/slug/` via
`redirects` in `astro.config.ts`.
