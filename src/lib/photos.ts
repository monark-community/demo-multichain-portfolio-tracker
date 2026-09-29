import desk from "../../public/images/desk-evening.jpg"
import strata from "../../public/images/strata.jpg"

/** Every photo on the site, with its Unsplash credit (also listed in docs/assets.md). */
export const PHOTOS = {
  strata: {
    src: strata,
    name: "Victor Rosario",
    profile: "https://unsplash.com/@victor_rosario",
    page: "https://unsplash.com/photos/volcanic-rock-strata-in-lanzarote-_Fii-Ng7FrE",
    usedOn: { en: "Home, How it works", fr: "Accueil, Fonctionnement" },
  },
  desk: {
    src: desk,
    name: "Mykyta Kravčenko",
    profile: "https://unsplash.com/@makitrenko",
    page: "https://unsplash.com/photos/a-woman-sitting-at-a-desk-in-front-of-a-lamp-R6HSykHkzvQ",
    usedOn: { en: "Home", fr: "Accueil" },
  },
} as const
