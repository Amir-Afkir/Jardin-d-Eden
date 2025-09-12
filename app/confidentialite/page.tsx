import React from "react";

const PolitiqueConfidentialitePage = () => {
  const currentDate = new Date().toLocaleDateString("fr-FR");

  return (
    <main className="max-w-3xl mx-auto p-6 bg-background text-foreground rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6">Politique de confidentialité – Jardin d’Eden</h1>
      <p className="mb-8 text-foreground/70">Dernière mise à jour : {currentDate}</p>

      <p className="mb-6 text-foreground">
        Chez Jardin d’Eden, la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
      </p>

      <ol className="list-decimal pl-6 space-y-0 text-foreground">
        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Collecte des données</h2>
          <p className="text-foreground">Nous recueillons des informations telles que votre nom, numéro de téléphone et ville lorsque vous remplissez nos formulaires de contact ou de demande de devis.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Utilisation des données</h2>
          <p className="text-foreground">Les données collectées sont utilisées uniquement pour répondre à vos demandes et améliorer nos services.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Partage avec des tiers</h2>
          <p className="text-foreground">Nous ne partageons pas vos informations personnelles avec des tiers, sauf si la loi l’exige ou pour fournir les services demandés.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Cookies et technologies similaires</h2>
          <p className="text-foreground">Le site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via les paramètres de votre navigateur.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Sécurité</h2>
          <p className="text-foreground">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Droits des utilisateurs</h2>
          <p className="text-foreground">Vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via notre formulaire.</p>
        </li>

        <li className="mt-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gold mb-2">Modifications de la politique</h2>
          <p className="text-foreground">Nous nous réservons le droit de modifier cette politique à tout moment. La version en ligne fait foi.</p>
        </li>
      </ol>
    </main>
  );
};

export default PolitiqueConfidentialitePage;