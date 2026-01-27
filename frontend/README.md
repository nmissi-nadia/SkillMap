# SkillMap - Frontend Angular

Application frontend Angular pour le système de gestion des compétences SkillMap.

## 🚀 Technologies

- **Angular 21.1** - Framework frontend
- **TypeScript 5.9** - Langage de programmation
- **SCSS** - Préprocesseur CSS
- **RxJS 7.8** - Programmation réactive
- **Vitest** - Framework de tests

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm (version 9 ou supérieure)
- Backend SkillMap en cours d'exécution sur `http://localhost:8080`

## 🛠️ Installation

```bash
# Installer les dépendances
npm install
```

## 🏃 Démarrage

```bash
# Démarrer le serveur de développement
npm start

# L'application sera accessible sur http://localhost:4200
# Les appels API seront automatiquement proxifiés vers http://localhost:8080
```

## 📦 Build

```bash
# Build de production
npm run build

# Les fichiers seront générés dans le dossier dist/
```

## 🧪 Tests

```bash
# Exécuter les tests unitaires
npm test

# Exécuter les tests en mode watch
npm run watch
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── app/                 # Composants et modules de l'application
│   │   ├── app.ts          # Composant racine
│   │   ├── app.routes.ts   # Configuration des routes
│   │   └── app.config.ts   # Configuration de l'application
│   ├── environments/        # Fichiers de configuration d'environnement
│   │   ├── environment.ts       # Configuration développement
│   │   └── environment.prod.ts  # Configuration production
│   ├── assets/             # Ressources statiques (images, fonts, etc.)
│   ├── styles.scss         # Styles globaux
│   └── index.html          # Page HTML principale
├── public/                  # Fichiers publics
├── proxy.conf.json         # Configuration du proxy pour le développement
├── angular.json            # Configuration Angular CLI
├── tsconfig.json           # Configuration TypeScript
└── package.json            # Dépendances et scripts npm
```

## 🔧 Configuration

### Environnements

Le projet utilise deux fichiers d'environnement :

- **environment.ts** : Configuration pour le développement (API: `http://localhost:8080/api`)
- **environment.prod.ts** : Configuration pour la production (API: `/api`)

### Proxy

Le fichier `proxy.conf.json` configure le proxy pour rediriger les appels `/api` vers le backend pendant le développement.

## 📝 Commandes utiles

```bash
# Générer un nouveau composant
ng generate component nom-du-composant

# Générer un nouveau service
ng generate service nom-du-service

# Générer un nouveau module
ng generate module nom-du-module

# Générer une nouvelle interface
ng generate interface nom-de-interface
```

## 🔗 Intégration avec le Backend

Le frontend communique avec le backend via des appels HTTP. Assurez-vous que :

1. Le backend est démarré sur `http://localhost:8080`
2. Le CORS est configuré correctement dans le backend pour accepter les requêtes depuis `http://localhost:4200`

## 📚 Documentation

- [Angular Documentation](https://angular.dev)
- [Angular CLI](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 👥 Contribution

Pour contribuer au projet :

1. Créer une branche pour votre fonctionnalité
2. Développer et tester vos modifications
3. Soumettre une pull request

## 📄 Licence

Projet interne SkillMap
