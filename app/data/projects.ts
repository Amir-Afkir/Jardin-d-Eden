export type Project = {
  slug: string;
  title: string;
  image: string;        // ex: "/projects/p1-1536.avif"
  blurDataURL: string; // optionnel
  tags: string[];
};

export const projects: ReadonlyArray<Project> = [
  {
    slug: "allee-lumineuse-jardin-contemporain",
    title: "Allée lumineuse & jardin contemporain",
    image: "/projects/p1-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p1",
    tags: ["allée", "éclairage"],
  },
  {
    slug: "espace-detente-bord-de-piscine",
    title: "Espace détente au bord de piscine",
    image: "/projects/p2-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p2",
    tags: ["piscine", "détente"],
  },
  {
    slug: "equilibre-pierres-vegetation",
    title: "Équilibre pierres & végétation",
    image: "/projects/p3-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p3",
    tags: ["mineral", "massifs"],
  },
  {
    slug: "massif-arrondi-palmiers-decoratifs",
    title: "Massif arrondi & palmiers décoratifs",
    image: "/projects/p6-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p6",
    tags: ["massif", "palmiers"],
  },
  {
    slug: "entree-illuminee-palmiers-exotiques",
    title: "Entrée illuminée & palmiers exotiques",
    image: "/projects/p5-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p5",
    tags: ["éclairage", "palmiers"],
  },
  {
    slug: "Parcours-élégant-en-pas-japonais",
    title: "Parcours élégant en pas japonais",
    image: "/projects/p4-1536.avif",
    blurDataURL: "data:image/webp;base64,PASTE_FROM_JSON_FOR_p4",
    tags: ["parcours", "japonais"],
  },
];