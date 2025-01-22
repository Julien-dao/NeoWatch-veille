// Fichier : config.js

// Clé API Google Custom Search
export const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";

// ID du moteur de recherche Programmable Search Engine
export const SEARCH_ENGINE_ID = "076048ef2f0074904";

// Autres constantes globales (si nécessaires)
export const DEFAULT_SEARCH_LIMIT = 10; // Nombre maximum de résultats par requête
export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD"; // Format de date par défaut
export const PROJECT_NAME = "NeoWatch";

// Messages personnalisés pour les alertes ou erreurs
export const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner au moins un filtre ou fournir des critères valides.",
    exportNoSelection: "Veuillez sélectionner au moins une entrée pour l'exportation.",
};

// URL de l'API (exemple pour centraliser la gestion)
export const GOOGLE_SEARCH_API_URL = `https://www.googleapis.com/customsearch/v1`;

// Exports pour une meilleure organisation
export default {
    GOOGLE_API_KEY,
    SEARCH_ENGINE_ID,
    DEFAULT_SEARCH_LIMIT,
    DEFAULT_DATE_FORMAT,
    PROJECT_NAME,
    MESSAGES,
    GOOGLE_SEARCH_API_URL,
};
