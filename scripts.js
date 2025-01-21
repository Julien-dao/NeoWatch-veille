// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");

// Fonction pour effectuer une recherche via l'API DuckDuckGo
async function performDuckDuckGoSearch() {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

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

    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`;

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
        if (!data.RelatedTopics || data.RelatedTopics.length === 0) {
            console.warn("Aucun résultat trouvé. Utilisation de résultats fictifs.");
            updateTable(generateMockResults(query, selectedFilters, startDate, endDate));
            return;
        }

        const results = parseDuckDuckGoResults(data, selectedFilters, startDate, endDate);
        console.log("Résultats parsés : ", results);

        updateTable(results);
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        alert("Une erreur s'est produite lors de la recherche. Vérifiez votre connexion ou réessayez.");
    }
}

// Fonction pour parser les résultats de DuckDuckGo
function parseDuckDuckGoResults(data, filters, startDate, endDate) {
    if (!data.RelatedTopics) return [];

    return data.RelatedTopics.map((item, index) => ({
        date: new Date().toISOString().split("T")[0], // Date actuelle
        source: "DuckDuckGo",
        content: item.Text || "Résumé non disponible",
        action: "Non défini", // Action requise (modifiable selon logique métier)
        deadline: "Non définie", // Date d'échéance (modifiable)
        category: filters.join(", ") || "Non catégorisé"
    }));
}

// Fonction pour générer des résultats fictifs
function generateMockResults(query, filters, startDate, endDate) {
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
searchButton.addEventListener("click", performDuckDuckGoSearch);
