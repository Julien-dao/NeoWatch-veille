// Configuration intégrée (anciennement dans config.js)
const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const GOOGLE_SEARCH_ENGINE_ID = "076048ef2f0074904";
const DEFAULT_SEARCH_LIMIT = 10;

const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner au moins un filtre ou fournir des critères valides.",
    exportNoSelection: "Veuillez sélectionner au moins une entrée pour l'exportation.",
};

const GOOGLE_SEARCH_API_URL = `https://www.googleapis.com/customsearch/v1`;

// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");
const cards = {
    legale: document.getElementById("card-legale"),
    competence: document.getElementById("card-competence"),
    innovation: document.getElementById("card-innovation"),
    handicap: document.getElementById("card-handicap")
};

// Fonction utilitaire pour nettoyer le texte HTML
function cleanText(text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Fonction pour effectuer une recherche via l'API Google Custom Search
async function performGoogleSearch() {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);

    const query = generateQuery(selectedFilters);

    if (!query.trim()) {
        alert(MESSAGES.emptyFilters);
        return;
    }

    const startDate = startDateInput.value ? ` after:${startDateInput.value}` : "";
    const endDate = endDateInput.value ? ` before:${endDateInput.value}` : "";

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query + startDate + endDate)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            alert(MESSAGES.noResults);
            clearTable();
            return;
        }

        const results = parseGoogleSearchResults(data);
        appendToTable(results);
    } catch (error) {
        alert(MESSAGES.errorFetching);
        console.error("Erreur lors de la recherche :", error);
    }
}

// Fonction pour générer la requête en fonction des filtres sélectionnés
function generateQuery(filters) {
    const queries = {
        legale: "Lois sur la formation professionnelle OR droit du travail OR subventions",
        competence:
            '"reconversion professionnelle" OR "évolution des métiers" OR "formations certifiantes"',
        innovation: '"intelligence artificielle" OR "e-learning" OR "microlearning"',
        handicap: '"Accessibilité numérique" OR "troubles apprentissage" OR "aides financières"',
    };

    return filters.map(filter => queries[filter] || "").join(" ");
}

// Fonction pour parser les résultats de Google Custom Search
function parseGoogleSearchResults(data) {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]["article:published_time"] || "Non disponible",
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: "Non catégorisé",
    }));
}

// Génération de la liste d'actions par défaut
function generateActionList() {
    return `
        <ul class="todo-list">
            <li><input type="checkbox"> Lire</li>
            <li><input type="checkbox"> Partager</li>
            <li><input type="checkbox"> Enregistrer</li>
            <li><button class="add-action">Ajouter</button></li>
        </ul>
    `;
}

// Fonction pour ajouter des entrées au tableau sans écraser les données existantes
function appendToTable(results) {
    clearTable();

    results.forEach((result, index) => {
        const row = `
            <tr>
                <td><input type="checkbox" class="select-row" data-index="${index}"></td>
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

    document.querySelectorAll(".add-action").forEach(button => {
        button.addEventListener("click", handleAddAction);
    });

    updateCards();
}

// Fonction pour vider la table
function clearTable() {
    entriesTable.innerHTML = `<tr><td colspan="7">Aucune donnée disponible</td></tr>`;
}

// Gestionnaire pour ajouter une nouvelle tâche
function handleAddAction(event) {
    const newAction = prompt("Ajoutez une nouvelle action :");
    if (newAction) {
        const todoList = event.target.closest(".todo-list");
        const newItem = `<li><input type="checkbox"> ${newAction}</li>`;
        todoList.insertAdjacentHTML("beforeend", newItem);
    }
}

// Fonction pour exporter en XLS
function exportToXLS() {
    const selectedRows = Array.from(document.querySelectorAll(".select-row:checked")).map(row =>
        row.closest("tr")
    );

    if (selectedRows.length === 0) {
        alert(MESSAGES.exportNoSelection);
        return;
    }

    const rows = selectedRows.map(row =>
        Array.from(row.querySelectorAll("td")).map(cell => cleanText(cell.innerHTML))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([
        ["NEOWATCH - VEILLE : Votre veille professionnelle en 3 clics"],
        [],
        ["Sélection", "Date", "Source", "Contenu", "Action", "Échéance", "Catégorie"],
        ...rows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veille");
    XLSX.writeFile(workbook, "export.xlsx");
}

// Mise à jour des cartes statistiques
function updateCards() {
    const categoryCounts = { legale: 0, competence: 0, innovation: 0, handicap: 0 };

    Array.from(entriesTable.rows).forEach(row => {
        const categoryCell = row.querySelector("td:nth-child(7)");
        if (categoryCell) {
            const category = categoryCell.textContent.trim();
            if (categoryCounts[category] !== undefined) {
                categoryCounts[category]++;
            }
        }
    });

    Object.keys(categoryCounts).forEach(category => {
        if (cards[category]) {
            cards[category].querySelector("strong").textContent = categoryCounts[category];
        }
    });
}

// Ajout des gestionnaires d'événements
searchButton.addEventListener("click", performGoogleSearch);
exportXlsButton.addEventListener("click", exportToXLS);
