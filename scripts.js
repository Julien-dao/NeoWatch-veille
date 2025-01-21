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
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Erreur lors de la récupération des résultats");

        const data = await response.json();
        const results = parseDuckDuckGoResults(data, selectedFilters, startDate, endDate);

        updateTable(results);
    } catch (error) {
        console.error("Erreur : ", error);
        alert("Une erreur s'est produite lors de la recherche.");
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
