export type Service = {
  key: "gazon" | "cloture" | "entretien" | "creation" | "pavage" | "arrosage" | "autre";
  title: string;
  desc: string;
};

export const services: ReadonlyArray<Service> = [
  {
    key: "gazon",
    title: "Gazon en rouleau",
    desc: "Pose express, rendu immédiat, variétés adaptées au climat local.",
  },
  {
    key: "cloture",
    title: "Clôture",
    desc: "Clôtures bois, grillage rigide, occultants — esthétique & sécurité.",
  },
  {
    key: "entretien",
    title: "Entretien",
    desc: "Taille, désherbage, tonte, fertilisation — contrats saisonniers.",
  },
  {
    key: "creation",
    title: "Création",
    desc: "Réalisation complète de jardin : massifs, allées, éclairage, bassins.",
  },
  {
    key: "pavage",
    title: "Pavage",
    desc: "Terrasses & allées en pierre/pavés — poses durables et antidérapantes.",
  },
  {
    key: "arrosage",
    title: "Arrosage automatique",
    desc: "Systèmes pilotés & économes, programmateurs et goutte-à-goutte.",
  },
];