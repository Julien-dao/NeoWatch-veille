// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");

// Configuration API
const API_KEY = "AIzaSyCnzFFRnsDl3U22TfPYz2iEG4HkNPn_4PM"; // Ta clé API
const SEARCH_ENGINE_ID = "076048ef2f0074904"; // Ton ID de moteur de recherche

// Fonction pour effectuer une recherche via Google Custom Search API
async function performGoogleSearch() {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);

    // Génération de mots-clés spécifiques pour chaque filtre
    let query = "";
    if (selectedFilters.includes("legale")) {
        query += "veille légale pour organisme de formation veille réglementaire ";
    }
    if (selectedFilters.includes("competence")) {
        query += "veille sur les métiers pour organisme de formation ";
    }
    if (selectedFilters.includes("innovation")) {
        query += "nouveaux outils pédagogiques pour la formation ";
    }
    if (selectedFilters.includes("handicap")) {
        query += "adaptations formation pour handicap ";
    }

    // Si aucun filtre n'est sélectionné, utiliser une requête par défaut
    if (!query.trim()) {
        query = "veille formation pour organisme de formation";
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;

    try {
        console.log("Requête générée : ", query);
        const response = await fetch(apiUrl);

        // Vérifie si la réponse est correcte
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Structure complète des données reçues : ", JSON.stringify(data, null, 2));

        // Vérifie si les résultats sont exploitables
        if (!data.items || data.items.length === 0) {
            console.warn("Aucun résultat trouvé. Utilisation de résultats fictifs.");
            updateTable(generateMockResults(query, selectedFilters));
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters);
        console.log("Résultats parsés : ", results);

        updateTable(results);
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        alert("Une erreur s'est produite lors de la recherche. Vérifiez votre connexion ou réessayez.");
    }
}

// Fonction pour parser les résultats de Google Custom Search API
function parseGoogleSearchResults(data, filters) {
    return data.items.map(item => ({
        date: new Date().toISOString().split("T")[0], // Date actuelle
        source: item.displayLink || "Source inconnue",
        content: item.snippet || "Résumé non disponible",
        action: "Revue requise", // Action requise (modifiable selon logique métier)
        deadline: "Non définie", // Date d'échéance (modifiable)
        category: filters.join(", ") || "Non catégorisé"
    }));
}

// Fonction pour générer des résultats fictifs
function generateMockResults(query, filters) {
    return [
        {
            date: "2025-01-25",
            source: "Simulation",
            content: `Résultat fictif pour la requête : "${query}"`,
            action: "Revue requise",
            deadline: "2025-02-01",
            category: filters.join(", ") || "Non catégorisé"
        },
        {
            date: "2025-01-24",
            source: "Simulation",
            content: `Autre résultat fictif pour : "${query}"`,
            action: "Validation nécessaire",
            deadline: "2025-02-02",
            category: filters.join(", ") || "Non catégorisé"
        }
    ];
}

// Fonction pour mettre à jour la table avec les résultats
function updateTable(results) {
    entriesTable.innerHTML = ""; // Vide les entrées existantes

    if (results.length === 0) {
        const row = `<tr><td colspan="6">Aucun résultat disponible.</td></tr>`;
        entriesTable.insertAdjacentHTML("beforeend", row);
        return;
    }

    results.forEach(result => {
        const row = `
            <tr>
                <td>${result.date}</td>
                <td>${result.source}</td>
                <td>${result.content}</td>
                <td>${result.action}</td>
                <td>${result.deadline}</td>
                <td>${result.category}</td>
            </tr>
        `;
        entriesTable.insertAdjacentHTML("beforeend", row);
    });
}

// Ajout d'un événement au bouton "Rechercher"
searchButton.addEventListener("click", performGoogleSearch);
