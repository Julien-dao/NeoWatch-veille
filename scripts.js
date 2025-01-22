// Configuration du projet
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

// Sélection des éléments DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");
const themeToggleButton = document.getElementById("theme-toggle");

// Nettoyer le texte HTML
function cleanText(text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Générer la requête de recherche en fonction des filtres
function generateQuery(filters) {
    const queries = {
        legale: "Lois sur la formation professionnelle en france OR droit du travail en france OR subventions en france sur la formation professionnelle",
        competence: "reconversion professionnelle en france OR évolution des métiers en france OR formations certifiantes en france OR formation qualifiante en france",
        innovation: "intelligence artificielle et formation professionnelle en france OR e-learning en france OR microlearning en france OR formation par projet OR thecnologie de la formation en france OR didactique",
        handicap: "Accessibilité numérique en formation en france OR troubles apprentissage en formation professionnelle OR aides financières formation professionelle en france",
    };
    return filters.map(filter => queries[filter] || "").join(" ");
}

// Parser les résultats de l'API Google Custom Search
function parseGoogleSearchResults(data) {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]?.["article:published_time"] || "Non disponible",
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: "Non catégorisé",
    }));
}

// Générer la liste d'actions par défaut
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

// Ajouter les résultats au tableau
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
}

// Effacer les entrées du tableau
function clearTable() {
    entriesTable.innerHTML = `<tr><td colspan="7">Aucune donnée disponible</td></tr>`;
}

// Ajouter une nouvelle action
function handleAddAction(event) {
    const newAction = prompt("Ajoutez une nouvelle action :");
    if (newAction) {
        const todoList = event.target.closest(".todo-list");
        const newItem = `<li><input type="checkbox"> ${newAction}</li>`;
        todoList.insertAdjacentHTML("beforeend", newItem);
    }
}

// Exporter en fichier XLS
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

// Basculer entre les thèmes clair et sombre
function toggleTheme() {
    const isLightTheme = document.body.classList.toggle("light-theme");
    themeToggleButton.textContent = isLightTheme ? "🌑 Mode sombre" : "🌕 Mode clair";
}

// Effectuer une recherche avec l'API Google
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

// Gestionnaires d'événements
searchButton.addEventListener("click", performGoogleSearch);
themeToggleButton.addEventListener("click", toggleTheme);
exportXlsButton.addEventListener("click", exportToXLS);
