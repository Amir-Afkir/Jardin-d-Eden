import React from "react";

const MentionsLegalesPage = () => {
  const currentDate = new Date().toLocaleDateString("fr-FR");

  return (
    <main className="max-w-3xl mx-auto p-6 bg-background text-foreground rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6">Mentions légales – Jardin d’Eden</h1>
      <p className="mb-8 text-foreground/70">Dernière mise à jour : {currentDate}</p>

      <section className="space-y-6">
        {/* 1. Éditeur du site */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">1. Éditeur du site</h2>
          <p className="text-foreground">
            <strong>LE JARDIN D’EDEN</strong><br />
            Forme juridique : SASU (société par actions simplifiée unipersonnelle)<br />
            Capital social : 1&nbsp;000,00&nbsp;€<br />
            SIREN : 940&nbsp;465&nbsp;297 — RCS Orléans n° 940&nbsp;465&nbsp;297<br />
            Numéro de TVA intracommunautaire : FR68940465297<br />
            Siège social : 44 rue des Frères de Pontbriand, 45370 Cléry-Saint-André, France<br />
            Activité (APE/NAF) : 81.30Z — Services d’aménagement paysager
          </p>
          <p className="text-foreground mt-2">
            <strong>Directeur de la publication :</strong> Touzani Mustapha (Président)
          </p>
          <p className="text-foreground mt-2">
            <strong>Contact :</strong>{" "}
            <a className="underline" href="mailto:contact@jardindeden.example">contact@jardindeden.example</a>{" "}
            / <span>+33&nbsp;X&nbsp;XX&nbsp;XX&nbsp;XX&nbsp;XX</span>
            <br />
            (Remplace l’email et le téléphone par tes coordonnées réelles)
          </p>
        </div>

        {/* 2. Hébergeur */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">2. Hébergeur</h2>
          <p className="text-foreground">
            <strong>Netlify, Inc.</strong><br />
            2325 3rd Street, Suite 296, San Francisco, CA 94107, USA<br />
            Site : <a className="underline" href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">netlify.com</a>
          </p>
        </div>

        {/* 3. Accès et utilisation */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">3. Accès et utilisation</h2>
          <p className="text-foreground">
            L’accès au site <a className="underline" href="https://jardindeden.netlify.app">https://jardindeden.netlify.app</a> est gratuit. 
            L’utilisateur s’engage à respecter la législation en vigueur et à ne pas porter atteinte au bon fonctionnement du site.
          </p>
        </div>

        {/* 4. Propriété intellectuelle */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">4. Propriété intellectuelle</h2>
          <p className="text-foreground">
            Les contenus du site (textes, images, vidéos, logos, éléments graphiques et codes) sont protégés par le droit d’auteur et/ou la propriété industrielle. 
            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite est interdite.
          </p>
        </div>

        {/* 5. Données personnelles & cookies */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">5. Données personnelles & cookies</h2>
          <p className="text-foreground">
            Pour comprendre comment nous collectons et traitons vos données (formulaire de contact/devis, cookies, intégrations TikTok, Mapbox, etc.), 
            consultez notre <a className="underline" href="/confidentialite">Politique de confidentialité</a>.
          </p>
        </div>

        {/* 6. Liens et services tiers */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">6. Liens et services tiers</h2>
          <p className="text-foreground">
            Le site peut intégrer des services fournis par des tiers (ex. TikTok pour l’affichage de vidéos, Mapbox pour la cartographie). 
            L’utilisation de ces services est soumise à leurs conditions et politiques propres.
          </p>
        </div>

        {/* 7. Responsabilités */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">7. Responsabilités</h2>
          <p className="text-foreground">
            Nous mettons tout en œuvre pour assurer l’exactitude et l’accessibilité des informations. 
            Toutefois, nous ne garantissons pas l’absence d’erreurs, d’interruptions ou d’indisponibilités. 
            L’éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l’utilisation du site.
          </p>
        </div>

        {/* 8. Droit applicable & litiges */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">8. Droit applicable & litiges</h2>
          <p className="text-foreground">
            Les présentes mentions légales sont soumises au droit français. 
            En cas de litige, et à défaut de résolution amiable, compétence est attribuée aux tribunaux français territorialement compétents.
          </p>
        </div>

        {/* 9. Contact */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">9. Contact</h2>
          <p className="text-foreground">
            Pour toute question relative aux mentions légales, vous pouvez nous écrire à{" "}
            <a className="underline" href="mailto:contact@jardindeden.example">contact@jardindeden.example</a>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default MentionsLegalesPage;