// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const refreshButton = document.querySelector(".refresh-button");
const entriesTable = document.querySelector(".dashboard-table tbody");

// Fonction pour générer une recherche Google
function performGoogleSearch() {
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
    if (startDate) {
        query += ` après ${startDate}`;
    }
    if (endDate) {
        query += ` avant ${endDate}`;
    }

    // Simulation de résultats Google (à remplacer par une vraie API si nécessaire)
    const mockResults = [
        { date: "2025-01-20", category: selectedFilters[0] || "Légale", source: "Google", summary: `Résultat pour "${query}"` },
        { date: "2025-01-19", category: selectedFilters[1] || "Innovation", source: "Google", summary: `Autre résultat pour "${query}"` }
    ];

    // Mise à jour de la table "Entrées récentes"
    updateTable(mockResults);
}

// Fonction pour mettre à jour la table avec les résultats
function updateTable(results) {
    entriesTable.innerHTML = ""; // Vide les entrées existantes
    results.forEach(result => {
        const row = `
            <tr>
                <td>${result.date}</td>
                <td>${result.category}</td>
                <td>${result.source}</td>
                <td>${result.summary}</td>
                <td><button>Voir</button></td>
            </tr>
        `;
        entriesTable.insertAdjacentHTML("beforeend", row);
    });
}

// Ajout d'un événement au bouton "Actualiser"
refreshButton.addEventListener("click", performGoogleSearch);
