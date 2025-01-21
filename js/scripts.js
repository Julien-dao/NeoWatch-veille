// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const refreshButton = document.querySelector(".refresh-button");
const entriesTable = document.querySelector(".dashboard-table tbody");

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
        const results = parseDuckDuckGoResults(data);

        // Limitation à 100 résultats
        const limitedResults = results.slice(0, 100);
        updateTable(limitedResults);
    } catch (error) {
        console.error("Erreur : ", error);
        alert("Une erreur s'est produite lors de la recherche.");
    }
}

// Fonction pour parser les résultats de DuckDuckGo
function parseDuckDuckGoResults(data) {
    if (!data.RelatedTopics) return [];

    return data.RelatedTopics.map(item => ({
        date: new Date().toISOString().split("T")[0], // Date actuelle
        category: "DuckDuckGo",
        source: "DuckDuckGo",
        summary: item.Text || "Résultat sans résumé disponible"
    }));
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
refreshButton.addEventListener("click", performDuckDuckGoSearch);
