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
        .map(filter => filter.nextSibling.textContent.trim());

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Construction de la requête de recherche
    let query = "NeoWatch veille formation";
    if (selectedFilters.length > 0) {
        query += " " + selectedFilters.join(" ");
    }

    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`;

    try {
        console.log("Recherche en cours : ", query);
        const response = await fetch(apiUrl);

        // Vérifie si la réponse est correcte
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues de l'API : ", data);

        // Vérifie si les résultats sont exploitables
        if (!data.RelatedTopics || data.RelatedTopics.length === 0) {
            alert("Aucun résultat trouvé pour votre recherche.");
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

    return data.RelatedTopics.map(item => ({
        date: new Date().toISOString().split("T")[0], // Date actuelle
        source: "DuckDuckGo",
        content: item.Text || "Résumé non disponible",
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
searchButton.addEventListener("click", performDuckDuckGoSearch);
