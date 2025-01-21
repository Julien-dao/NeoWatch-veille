// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");

// Configuration de l'API Google Custom Search
const googleApiKey = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const googleSearchEngineId = "076048ef2f0074904";

// Fonction pour effectuer une recherche via l'API Google Custom Search
async function performGoogleSearch() {
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

    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
    )}&key=${googleApiKey}&cx=${googleSearchEngineId}`;

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
            alert("Aucun résultat trouvé pour votre recherche.");
            updateTable([]); // Affiche un message dans le tableau
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters, startDate, endDate);
        console.log("Résultats parsés : ", results);

        updateTable(results);
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        alert("Une erreur s'est produite lors de la recherche. Vérifiez votre connexion ou réessayez.");
    }
}

// Fonction pour parser les résultats de Google Custom Search
function parseGoogleSearchResults(data, filters, startDate, endDate) {
    return data.items.map(item => ({
        date: new Date().toISOString().split("T")[0], // Date actuelle
        source: item.displayLink || "Google",
        content: item.snippet || "Résumé non disponible",
        action: "Non défini", // Action requise (modifiable selon logique métier)
        deadline: "Non définie", // Date d'échéance (modifiable)
        category: filters.join(", ") || "Non catégorisé"
    }));
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
