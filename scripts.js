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
        query += "Lois sur la formation professionnelle OR droit du travail OR subventions OR Centre de formation par apprentis OR nouvelle loi formation professionnelle ";
    }
    if (selectedFilters.includes("competence")) {
        query += "reconversion professionnelle OR évolution des métiers OR formations certifiantes site:francetravail.fr OR site:opco.fr OR site:travail.gouv.fr ";
    }
    if (selectedFilters.includes("innovation")) {
        query += "intelligence artificielle OR e-learning OR microlearning OR nouveaux outils en formation OR méthodes pédagogiques innovantes ";
    }
    if (selectedFilters.includes("handicap")) {
        query += "Accessibilité numérique OR troubles de l’apprentissage OR aides financières site:agefiph.fr OR site:fiphfp.fr OR site:francetravail.fr ";
    }

    if (!query.trim()) {
        query = "veille juridique France formation professionnelle";
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${googleApiKey}&cx=${googleSearchEngineId}`;

    try {
        console.log("Requête générée : ", query);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues : ", JSON.stringify(data, null, 2));

        if (!data.items || data.items.length === 0) {
            alert("Aucun résultat trouvé pour votre recherche.");
            updateTable([]);
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters, startDate, endDate);
        updateTable(results);
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        alert("Une erreur s'est produite lors de la recherche.");
    }
}

// Fonction pour parser les résultats de Google Custom Search
function parseGoogleSearchResults(data, filters, startDate, endDate) {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]?.["article:published_time"] || "Date non disponible",
        source: item.displayLink || "Google",
        link: item.link || "#",
        content: item.snippet || "Résumé non disponible",
        action: "Non défini",
        deadline: "Non définie",
        category: filters.join(", ") || "Non catégorisé"
    }));
}

// Fonction pour mettre à jour la table avec les résultats
function updateTable(results) {
    entriesTable.innerHTML = "";

    if (results.length === 0) {
        entriesTable.innerHTML = `<tr><td colspan="6">Aucun résultat disponible.</td></tr>`;
        return;
    }

    results.forEach(result => {
        const row = `
            <tr>
                <td>${result.date}</td>
                <td>${result.source}</td>
                <td><a href="${result.link}" target="_blank">${result.content}</a></td>
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
