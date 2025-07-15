
# GUARD


## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

- [Node.js](https://nodejs.org/) (version 20 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

## Installation

Pour installer les dépendances du projet, exécutez la commande suivante dans le répertoire du projet :

```bash
npm install
```

ou si vous utilisez yarn :

```bash
yarn install
```

## Configuration de l'environnement

Pour configurer votre environnement, suivez ces étapes :

1. Créez un fichier `.env` à la racine du projet en exécutant la commande suivante :

```bash
cp .env.local .env
```

Cela copiera le contenu du fichier `.env.local` dans un nouveau fichier `.env`.

2. Assurez-vous que le fichier `.env` contient les variables d'environnement nécessaires. Voici un exemple de ce à quoi il pourrait ressembler :

```env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=Mon Application Vite React
```

**Note :** Assurez-vous de ne pas commiter le fichier `.env` dans votre dépôt git, car il peut contenir des informations sensibles.

## Scripts disponibles

Dans le projet, vous pouvez exécuter les scripts suivants :

- `dev` : Lance l'application en mode développement.

  ```bash
  npm run dev
  ```

- `build` : Construit l'application pour la production.

  ```bash
  npm run build
  ```

- `serve` : Lance un serveur local pour prévisualiser la version de production.

  ```bash
  npm run serve
  ```

## Contribution


1. Fork le projet.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`).
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`).
4. Poussez vers la branche (`git push origin feature/AmazingFeature`).
5. Ouvrez une Pull Request.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.