# scripts/

This folder contains one-time utility scripts used during the Astro migration.
They are kept here in case they're useful in future projects.

| Script | What it does |
|---|---|
| `convert-assets.mjs` | Converts PNG/JPG images in `public/Asset/` to WebP format (80% quality). Run with `node scripts/convert-assets.mjs` |
| `refactor-to-image.mjs` | Scans `.astro` pages for `<img>` tags pointing to `/Asset/` and replaces them with Astro's `<Image />` component. Run with `node scripts/refactor-to-image.mjs` |

> **Note:** Both scripts have already been run on this project. Only re-run if you add new images that still need converting.
