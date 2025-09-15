export type Project = {
  slug: string;
  title: string;
  image: string;       // chemin depuis /public
  tags?: string[];
};

export const projects: ReadonlyArray<Project> = [
  {
    slug: "allee-lumineuse-jardin-contemporain",
    title: "Allée lumineuse & jardin contemporain",
    image: "/projects/p1.png",
    tags: ["allée", "éclairage"],
  },
  {
    slug: "espace-detente-bord-de-piscine",
    title: "Espace détente au bord de piscine",
    image: "/projects/p2.png",
    tags: ["piscine", "détente"],
  },
  {
    slug: "equilibre-pierres-vegetation",
    title: "Équilibre pierres & végétation",
    image: "/projects/p3.jpeg",
    tags: ["mineral", "massifs"],
  },
  {
    slug: "devanture-elegante-arbre-sculptural",
    title: "Devanture élégante & arbre sculptural",
    image: "/projects/p4.png",
    tags: ["devanture", "arbres"],
  },
  {
    slug: "entree-illuminee-palmiers-exotiques",
    title: "Entrée illuminée & palmiers exotiques",
    image: "/projects/p5.png",
    tags: ["éclairage", "palmiers"],
  },
  {
    slug: "massif-arrondi-palmiers-decoratifs",
    title: "Massif arrondi & palmiers décoratifs",
    image: "/projects/p6.png",
    tags: ["massif", "palmiers"],
  },
];