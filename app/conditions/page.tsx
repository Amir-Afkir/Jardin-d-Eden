import React from "react";

const ConditionsPage = () => {
  const currentDate = new Date().toLocaleDateString("fr-FR");

  return (
    <main className="max-w-3xl mx-auto p-6 bg-background text-foreground rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6">Conditions d’utilisation – Jardin d’Eden</h1>
      <p className="mb-8 text-foreground/70">Dernière mise à jour : {currentDate}</p>

      <p className="mb-6 text-foreground">
        Bienvenue sur Jardin d’Eden (<a href="https://jardindeden.netlify.app" className="text-gold underline">https://jardindeden.netlify.app</a>).
        En utilisant notre site ou nos services, vous acceptez les présentes conditions d’utilisation :
      </p>

      <ol className="list-decimal pl-6 space-y-0 text-foreground">
        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Objet du site</h2>
          <p className="text-foreground">Jardin d’Eden propose des prestations de conception, aménagement et entretien paysager.</p>
          <p className="text-foreground">Le site présente nos réalisations et permet de prendre contact ou demander un devis.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Accès et utilisation</h2>
          <p className="text-foreground">L’accès au site est gratuit.</p>
          <p className="text-foreground">L’utilisateur s’engage à utiliser le site de manière conforme à la loi et à ne pas perturber son bon fonctionnement.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Contenus</h2>
          <p className="text-foreground">Les textes, images, vidéos (incluant les intégrations TikTok) sont protégés par le droit d’auteur.</p>
          <p className="text-foreground">Toute reproduction ou utilisation non autorisée est interdite.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Responsabilités</h2>
          <p className="text-foreground">Nous nous efforçons d’assurer l’exactitude des informations mais ne garantissons pas l’absence d’erreurs ou d’interruptions.</p>
          <p className="text-foreground">Jardin d’Eden ne pourra être tenu responsable en cas de dommages liés à l’utilisation du site.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Liens et services tiers</h2>
          <p className="text-foreground">Le site peut inclure des contenus ou intégrations tiers (ex. TikTok, Mapbox).</p>
          <p className="text-foreground">Leur utilisation est soumise aux conditions propres de ces services.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Données personnelles</h2>
          <p className="text-foreground">Les informations collectées via nos formulaires (nom, téléphone, ville) servent uniquement à répondre aux demandes de devis.</p>
          <p className="text-foreground">Pour plus d’informations, consultez notre Politique de confidentialité.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Modification des conditions</h2>
          <p className="text-foreground">Nous nous réservons le droit de modifier ces conditions à tout moment.</p>
          <p className="text-foreground">La version en ligne fait foi.</p>
        </li>
      </ol>
    </main>
  );
};

export default ConditionsPage;