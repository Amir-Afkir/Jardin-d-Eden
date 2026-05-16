export type Project = {
  slug: string;
  title: string;
  image: string;
  blurDataURL: string;
  description: string;
  tags: string[];
};

export const projects: ReadonlyArray<Project> = [
  {
    slug: "allee-lumineuse-jardin-contemporain",
    title: "Allée lumineuse & jardin contemporain",
    image: "/projects/p1-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAABwBQCdASoYABIAPyWEu1UuKKYjKAqpwCSJZQDGfBEOE0B+tQ29hR5cra6KdqMKoxdmhLgAAP7ow4MiwRnjY4ASyyWplfQrvL64Btq0UZn3cyscia+E7hUgDG1+73WTR2kA1mwW9FdkKfgwl4uhp5MhR8VyEL7YA/BvAkgMwuDAAAAA",
    description: "Allée pavée, éclairage d’ambiance et massifs graphiques pour une entrée plus sûre et plus élégante.",
    tags: ["allée", "éclairage"],
  },
  {
    slug: "espace-detente-bord-de-piscine",
    title: "Espace détente au bord de piscine",
    image: "/projects/p2-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAACQAwCdASoYAAwAPyV6tFGuJ6UisAgBwCSJQBfnAuhYgTVfHyaAAPQ5uQZi+DHrXO+liR4UjsBV1+FEvmbovYjJDI8DYywbBCXTIqvK5IRJLYfL/SHpckXIiMKHXrnbonq0CgAA",
    description: "Minéral, végétal et zones de circulation structurées autour d’un espace piscine facile à vivre.",
    tags: ["piscine", "détente"],
  },
  {
    slug: "equilibre-pierres-vegetation",
    title: "Équilibre pierres & végétation",
    image: "/projects/p3-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAwAwCdASoYAAwAPyV8tVIuJ6UisAgBwCSJQAADcFFZqdAAAPpHmll+NcEf8dnUVWA4l43ixNFw5UCBUsYMNcozLzAcAepaalzkj5a9qYPQdtq3OQI+QZ/Lbj86UGPe+Fk/UG7S+HdqKYhMdZkIAA==",
    description: "Composition de massifs, paillage minéral et sélection végétale pour un rendu dense et durable.",
    tags: ["mineral", "massifs"],
  },
  {
    slug: "massif-arrondi-palmiers-decoratifs",
    title: "Massif arrondi & palmiers décoratifs",
    image: "/projects/p6-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAABQBQCdASoYABIAPyWEtlYuKCSjqAqpwCSJQBe7xAACPekoZV04eeCGOSDP3cjmg12mD1gA+kFz3HkiUB2CkqA81D6kQTEG2R7dihabQTYcfNtAF21nCiD4wwl77j3zPOic610lL/6RHak0sZnrri2mzclL9jM6vDF78pkOFxWAllOc796ud58TJvgcChX3tFNCV6KIg24kW40hrjbGPTYgw6wAAA==",
    description: "Massif courbe, palmiers et bordures nettes pour donner du volume à un petit extérieur.",
    tags: ["massif", "palmiers"],
  },
  {
    slug: "entree-illuminee-palmiers-exotiques",
    title: "Entrée illuminée & palmiers exotiques",
    image: "/projects/p5-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAADQAwCdASoYAAsAPyV6tFGuJ6UisAgBwCSJQBdgAoXr+JjpTpZsOwAAyeFeaC3p4AaOIQAHmu2QJzcvJLTmDE4y4PqyBvbAhcBWsEoW4RkxOw1iVxFiRmb44predyC12Eoc+NDYLKw+sib5IKjMrphoAAA=",
    description: "Éclairage bas, plantations exotiques et surfaces minérales pour valoriser l’entrée de nuit.",
    tags: ["éclairage", "palmiers"],
  },
  {
    slug: "parcours-elegant-en-pas-japonais",
    title: "Parcours élégant en pas japonais",
    image: "/projects/p4-1536.avif",
    blurDataURL: "data:image/webp;base64,UklGRtYAAABXRUJQVlA4IMoAAACQBQCdASoYACsAPx12slGtJySisBqtUaAjiWMAxNwIAK74Dng7w9cujY/3oXI84hUvMIrRQAD+A9EUKznIGuLG0mjQcQ1xYz3s37NAM2dwJTCBshSowNDBPuKP08ER3XX39vfoCh0+ZR4iCKrHdbj/tdrWatwh/VRXWi1g32HC9pC/ACOS4/XE+ZYH6GjMy1MdUnljx8E1pEXPuChWdhs4ZCU4k51iOC2UBkn7IvL6woEAgz++uzbIAOI4rTcZ0Px3bqpNGa+X4AAA",
    description: "Pas japonais, gravier clair et bordures sobres pour créer un chemin praticable et graphique.",
    tags: ["parcours", "japonais"],
  },
];
