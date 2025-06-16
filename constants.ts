export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const DEFAULT_SYMFONY_ANALYSIS_PROMPT_TEMPLATE = `Vous êtes un assistant chargé d'évaluer des projets Symfony sur GitHub pour des débutants. 
Pour le dépôt GitHub suivant : {{REPO_URL}}

1. Vérifiez si ce dépôt est un projet Symfony. Cherchez des indices simples comme :
   - La présence d’un fichier **composer.json** mentionnant "symfony/framework-bundle".
   - Une structure de dossiers typique : **config/**, **src/**, **templates/**, **public/index.php**, ou **bin/console**.
2. Si ce n’est PAS un projet Symfony, indiquez-le clairement dans l’analyse (ex: "Ce dépôt ne semble pas être un projet Symfony.") et attribuez une note de -1.
3. Si c’EST un projet Symfony :
   a. Fournissez une description simple du projet (son but, si identifiable, et la version de Symfony si visible).
   b. Évaluez les aspects de **performance** de manière accessible :
      - Utilisation de **Doctrine** (présence d’entités dans **src/Entity/**, relations simples comme OneToMany ou ManyToOne).
      - Mise en cache de base (ex: fichiers de cache générés dans **var/cache/**).
      - Organisation des **assets** (ex: utilisation de fichiers CSS/JS dans **public/** ou Webpack Encore).
      - Utilisation de **services** (présence de fichiers dans **src/Service/**, configuration dans **config/services.yaml**, ou injection de dépendances dans les contrôleurs).
   c. Évaluez les aspects de **sécurité** de manière simplifiée :
      - Utilisation de formulaires avec protection **CSRF** (jetons CSRF dans les formulaires Twig).
      - **Échappement des données** dans les templates Twig pour éviter les failles XSS.
      - Gestion des **variables d’environnement** (ex: fichier **.env** pour stocker les secrets comme les mots de passe).
      - Présence de contrôles d’accès simples (ex: routes protégées par un login dans **config/packages/security.yaml**).
   d. Vérifiez l’utilisation de **DTO** (Data Transfer Objects) :
      - Cherchez des classes dans **src/DTO/** ou des classes utilisées pour structurer les données échangées (ex: entre contrôleurs et templates, ou avec une API).
      - Notez si les DTO sont utilisés pour simplifier la gestion des données (ex: formulaires, réponses API).
   e. Vérifiez l’utilisation d’une **API** :
      - Cherchez des indices d’une API (ex: dépendance "api-platform/api-pack" dans **composer.json**, routes dans **config/routes.yaml** avec des préfixes comme /api/, ou contrôleurs dédiés dans **src/Controller/** pour des endpoints API).
      - Notez si l’API utilise des bonnes pratiques simples (ex: réponses JSON, codes HTTP appropriés).
   f. Évaluez les principes de **clean code** :
      - Lisibilité du code (ex: noms de variables et fonctions clairs, commentaires utiles).
      - Organisation du code (ex: séparation des responsabilités entre contrôleurs, services, et entités).
      - Absence de code redondant ou inutilisé (ex: fonctions ou classes non utilisées).
   g. Mentionnez des **bonnes pratiques** observées (ex: structure claire, commentaires dans le code, services bien organisés, DTO bien définis, API bien structurée, code propre) ou des **points à améliorer** (ex: absence de fichier .env, code désorganisé, services non utilisés, DTO manquants, API mal documentée, code peu lisible).
4. Attribuez une note combinée pour la performance, la sécurité, l’utilisation d’API, et le clean code sur une échelle de 0 à 10 :
   - 0 : Problèmes majeurs (ex: code non fonctionnel, failles évidentes, code illisible).
   - 5 : Projet correct mais avec des améliorations possibles.
   - 10 : Projet bien structuré, sécurisé, avec une API bien conçue, un code propre, et respectant les bases de Symfony.
5. Si le dépôt est vide, manque de code pertinent, ou ne permet pas une évaluation claire, attribuez une note de -1 et expliquez pourquoi dans l’analyse.`;

export const GEMINI_JSON_RESPONSE_INSTRUCTION = `
ajouter un explicaton de pour qoui avoir 7;
Répondez UNIQUEMENT avec un objet JSON valide contenant les clés "analysis" (string) et "rating" (number). Exemple :
{
  "analysis": "Ce projet utilise Symfony 6.x pour une application simple avec une API. Les formulaires incluent des jetons CSRF, mais le fichier .env est absent. Des services sont définis dans src/Service/, et des DTO sont utilisés pour l’API. Le code est lisible mais contient des fonctions redondantes.",
  "rating": 7
}`;
