// Configuration
const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const GOOGLE_SEARCH_ENGINE_ID = "076048ef2f0074904";
const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";

// Messages
const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner un filtre valide.",
    exportNoSelection: "Veuillez sélectionner au moins une entrée pour l'exportation.",
};

// DOM Elements
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");

// Liaison des cartes filtres
document.addEventListener("DOMContentLoaded", () => {
    const filterCards = document.querySelectorAll(".filter-card");
    filterCards.forEach((card) => {
        card.addEventListener("click", () => {
            const filter = card.dataset.filter;
            if (filter) {
                performGoogleSearch(filter);
            } else {
                alert(MESSAGES.emptyFilters);
            }
        });
    });
});

// Dictionnaire des requêtes associées aux filtres
const QUERY_MAP = {
    legale: "Loi OR réglementation",
    competence: "Évolution des métiers",
    innovation: "Technologie OR intelligence artificielle",
    handicap: "Accessibilité OR inclusion",
    financement: "Financement OR subventions",
    evaluation: "Évaluation OR certification",
    reformes: "Réformes OR lois récentes",
    developpement_durable: "Développement durable OR écologie",
};

// 🔍 **Requête de recherche Google**
const performGoogleSearch = async (filter) => {
    if (!QUERY_MAP[filter]) {
        alert("Filtre inconnu ou non défini.");
        return;
    }

    const query = QUERY_MAP[filter];

    // 🔥 Correction : Encodage de l'URL et ajout du paramètre `num=20` pour récupérer 20 articles
    const params = new URLSearchParams({
        q: query,
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        lr: "lang_fr",
        num: "20",
    });

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?${params.toString()}`;

    console.log("🔍 URL générée :", apiUrl);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Réponse API :", data);

        if (!data.items || data.items.length === 0) {
            alert(MESSAGES.noResults);
            clearTable();
            return;
        }

        appendToTable(parseGoogleSearchResults(data));
    } catch (error) {
        alert(MESSAGES.errorFetching);
        console.error("🚨 Erreur lors de la recherche :", error);
    }
};

// Rendre `performGoogleSearch` accessible depuis `dashboard.html`
window.performGoogleSearch = performGoogleSearch;

// 🔄 **Analyser les résultats Google**
const parseGoogleSearchResults = (data) => {
    return data.items.map((item) => ({
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: "Non catégorisé",
    }));
};

// ✅ **Générer la liste des actions**
const generateActionList = () => `
    <ul class="todo-list">
        <li><input type="checkbox"> Lire</li>
        <li><input type="checkbox"> Partager</li>
        <li><input type="checkbox"> Enregistrer</li>
    </ul>
`;

// 📊 **Mettre à jour le tableau avec les résultats**
const appendToTable = (results) => {
    if (!results || results.length === 0) {
        clearTable();
        alert(MESSAGES.noResults);
        return;
    }

    entriesTable.innerHTML = results
        .map((result) => `
            <tr>
                <td><input type="checkbox" class="select-row"></td>
                <td>${result.source}</td>
                <td>${result.content}</td>
                <td>${result.action}</td>
                <td>${result.deadline}</td>
                <td>${result.category}</td>
            </tr>
        `)
        .join("");
};

// 🗑️ **Nettoyer le tableau**
const clearTable = () => {
    entriesTable.innerHTML = `<tr><td colspan="6">Aucune donnée disponible</td></tr>`;
};

// 📥 **Exporter en XLS**
const exportToXLS = () => {
    alert("Export en XLS non implémenté !");
};

// 🎯 **Ajouter les événements**
if (searchButton) searchButton.addEventListener("click", () => performGoogleSearch("legale"));  
if (exportXlsButton) exportXlsButton.addEventListener("click", exportToXLS);
