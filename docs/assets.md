# Assets

Every photo is from Unsplash under the free [Unsplash License](https://unsplash.com/license) (no Unsplash+ images). Files were downloaded at 2000px on the long edge, JPEG quality 72, and are served with `next/image`. Photographers are credited on `/credits` (linked from the footer).

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/strata.jpg` | https://unsplash.com/photos/volcanic-rock-strata-in-lanzarote-_Fii-Ng7FrE | [Victor Rosario](https://unsplash.com/@victor_rosario) | Home, "Every network is a layer" section; How it works, header band |
| `public/images/desk-evening.jpg` | https://unsplash.com/photos/a-woman-sitting-at-a-desk-in-front-of-a-lamp-R6HSykHkzvQ | [Mykyta Kravčenko](https://unsplash.com/@makitrenko) | Home, "Tax season" section |

## Built in code (no image files)

| Asset | Where |
|-|-|
| Logo mark and wordmark (`src/components/site/logo.tsx`) | Header, footer, mobile menu |
| Favicon (`src/app/icon.svg`) | Browser tab |
| Open Graph image (`src/app/[locale]/opengraph-image.tsx`) | Social previews, per locale |
| Hero strata card (`src/components/home/hero-card.tsx`) | Home hero |
| Feature mini UIs (`src/components/home/feature-mini.tsx`) | Home features |
| Pipeline diagram | How it works |
| Strata band, sync panel, performance chart (hand-drawn SVG) | Demo app |
| NFT artwork (generated SVG per token id, `src/components/demo/nft-grid.tsx`) | Demo app, Collectibles tab |

Icons: `lucide-react` only.
