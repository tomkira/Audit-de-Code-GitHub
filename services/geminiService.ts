import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { GroundingMetadata } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Variable d'environnement API_KEY non définie. Les appels à l'API Gemini échoueront.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface GeminiRepositoryAnalysisResponse {
  analysis: string;
  rating: number; // Note de 0 à 10, -1 si erreur d'évaluation
}

export const analyzeRepositoryWithGemini = async (
  repoUrl: string
): Promise<{ analysis: string; rating: number; groundingMetadata?: GroundingMetadata }> => {
  if (!API_KEY) {
    throw new Error("API_KEY non configurée. Impossible d'analyser le dépôt.");
  }
  if (!repoUrl.trim()) {
    throw new Error("L'URL du dépôt GitHub ne peut pas être vide.");
  }

  const prompt = `Vous êtes un assistant expert en évaluation de projets Symfony et React.js sur GitHub. Pour le dépôt GitHub suivant : ${repoUrl}
Déterminez si ce dépôt semble être un projet Symfony et/ou React.js. Recherchez des indicateurs clés :
Pour Symfony : présence d'un fichier composer.json avec "symfony/framework-bundle", structure de dossiers typique (config/, src/, templates/, public/index.php, bin/console).
Pour React.js : présence d'un fichier package.json avec "react", structure de dossiers comme src/, public/, fichiers comme index.js ou App.js.
Si ce n'est PAS un projet Symfony ou React.js, indiquez-le clairement dans l'analyse (ex: "Ce dépôt ne semble pas être un projet Symfony ou React.js standard.") et attribuez une note de -1.
Si c'EST un projet Symfony et/ou React.js : a. Fournissez une brève analyse générale du projet (son objectif si déductible, version de Symfony ou React.js si apparente). b. Évaluez les aspects de clean code et best practices :
Pour Symfony/PHP :
Respect des principes SOLID et PSR-12 (convention de codage PHP).
Organisation du code (séparation des responsabilités, controllers légers, logique métier dans les services ou entités).
Utilisation correcte de l'ORM Doctrine (éviter les requêtes N+1, relations bien définies).
Gestion des formulaires (utilisation de Form component, validation).
Tests unitaires/fonctionnels (présence de PHPUnit, qualité des tests).
Pour React.js :
Respect des conventions JSX et ES6/ESNext.
Organisation des composants (composants réutilisables, séparation des préoccupations).
Gestion d'état (utilisation de hooks, Redux, Context API, ou alternatives).
Optimisation des rendus (mémorisation, lazy loading).
Tests unitaires (présence de Jest, React Testing Library, qualité des tests). c. Évaluez l'architecture du projet :
Structure des dossiers et modularité (organisation claire, séparation backend/frontend si applicable).
Communication entre frontend (React.js) et backend (Symfony API, REST/GraphQL, documentation API).
Gestion des dépendances ( Composer pour PHP, npm/yarn pour React.js, versions à jour).
Configuration des environnements (fichiers .env, configuration CI/CD si présente). d. Mettez en évidence des bonnes pratiques observées ou des points d'amélioration notables pour le clean code et l'architecture.
Attribuez une note combinée pour le clean code, les best practices et l'architecture sur une échelle de 0 à 10. Une note de 0 signifie de très gros problèmes, 5 acceptable avec des points d'amélioration, 10 excellent.
Répondez UNIQUEMENT avec un objet JSON valide contenant les clés "analysis" (string) et "rating" (number). Exemple : { "analysis": "Ce projet utilise Symfony 6.x et React.js 18.x. Le code Symfony respecte PSR-12 mais les controllers sont trop lourds. React.js utilise des hooks modernes mais manque de tests unitaires. L'architecture est modulaire avec une API REST bien définie...", "rating": 6 } Si, même s'il s'agit d'un projet Symfony ou React.js, vous ne pouvez pas fournir une évaluation significative ou une note (par exemple, le dépôt est vide ou ne contient pas de code pertinent), mettez la note à -1 et expliquez pourquoi dans l'analyse.

Répondez UNIQUEMENT avec un objet JSON valide contenant les clés "analysis" (string) et "rating" (number). Exemple :
{
  "analysis": "Ce projet utilise Symfony 6.x pour une application simple avec une API. Les formulaires incluent des jetons CSRF, mais le fichier .env est absent. Des services sont définis dans src/Service/, et des DTO sont utilisés pour l’API. Le code est lisible mais contient des fonctions redondantes.",
  "rating": 7
}`;

  try {
    const contents: Content[] = [{ role: "user", parts: [{text: prompt}] }];
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: contents,
      config: {
        responseMimeType: "application/json", 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    let parsedData: GeminiRepositoryAnalysisResponse;
    try {
        parsedData = JSON.parse(jsonStr);
    } catch (e) {
        console.error('Réponse Gemini non JSON ou malformée:', jsonStr, e);
        throw new Error("L'analyse Gemini a retourné une réponse malformée. Veuillez réessayer. Contenu brut: " + jsonStr.substring(0,100) + "...");
    }

    if (typeof parsedData.analysis !== 'string' || typeof parsedData.rating !== 'number') {
        console.error('Champs manquants ou de type incorrect dans la réponse JSON de Gemini:', parsedData);
        throw new Error("L'analyse Gemini n'a pas retourné tous les champs attendus (analyse et note).");
    }
    
    if (parsedData.rating < -1 || parsedData.rating > 10) {
        console.warn(`Note Gemini (${parsedData.rating}) en dehors de la plage attendue [-1, 10]. Ajustement à -1.`);
        parsedData.rating = -1; 
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    
    return { 
        analysis: parsedData.analysis, 
        rating: parsedData.rating, 
        groundingMetadata 
    };

  } catch (error) {
    console.error('Erreur lors de l\'analyse du dépôt avec Gemini :', error);
    if (error instanceof Error) {
        throw new Error(`${error.message}`);
    }
    throw new Error('Une erreur inconnue est survenue lors de l\'analyse du dépôt avec Gemini.');
  }
};