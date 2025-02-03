// Configuration
const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const GOOGLE_SEARCH_ENGINE_ID = "076048ef2f0074904";
const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";

// Messages
const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner un filtre valide.",
    exportNoSelection: "Veuillez sélectionner au moins une entrée pour l'exportation.",
    successSave: "Vos informations ont été enregistrées avec succès.",
    planSelection: "Vous avez sélectionné le forfait : ",
};

// DOM Elements
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");

// Liaison des cartes filtres
document.addEventListener("DOMContentLoaded", () => {
    const filterCards = document.querySelectorAll(".filter-card");
    filterCards.forEach((card) => {
        card.addEventListener("click", () => {
            const filter = card.dataset.filter;
            if (filter) {
                performGoogleSearch(filter);
            } else {
                alert(MESSAGES.emptyFilters);
            }
        });
    });
});

// **Perform Google Search avec 20 articles minimum**
const performGoogleSearch = async (filter) => {
    const queries = {
        legale: "Lois OR réglementation",
        competence: "Évolution des métiers",
        innovation: "Technologie OR IA",
        handicap: "Accessibilité",
        financement: "Financement",
        evaluation: "Évaluation et certification",
        reformes: "Réformes",
        developpement_durable: "Développement durable",
    };

    const query = queries[filter];
    if (!query) {
        alert("Filtre inconnu ou non défini.");
        return;
    }

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&lr=lang_fr&num=20`;

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
};

// Rendre `performGoogleSearch` accessible depuis `dashboard.html`
window.performGoogleSearch = performGoogleSearch;

// **Correction : suppression de la colonne "Date"**
const parseGoogleSearchResults = (data) => {
    return data.items.map((item) => ({
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: "Non catégorisé",
    }));
};

// **Génération des actions**
const generateActionList = () => `
    <ul class="todo-list">
        <li><input type="checkbox"> Lire</li>
        <li><input type="checkbox"> Partager</li>
        <li><input type="checkbox"> Enregistrer</li>
    </ul>
`;

// **Correction : suppression de la colonne "Date" dans l'affichage du tableau**
const appendToTable = (results) => {
    if (!results || results.length === 0) {
        clearTable();
        alert(MESSAGES.noResults);
        return;
    }

    entriesTable.innerHTML = results
        .map(
            (result) => `
            <tr>
                <td><input type="checkbox" class="select-row"></td>
                <td>${result.source}</td>
                <td>${result.content}</td>
                <td>${result.action}</td>
                <td>${result.deadline}</td>
                <td>${result.category}</td>
            </tr>
        `
        )
        .join("");
};

// **Efface le tableau si aucune donnée**
const clearTable = () => {
    entriesTable.innerHTML = `<tr><td colspan="6">Aucune donnée disponible</td></tr>`;
};

// **Export to XLS**
const exportToXLS = () => {
    const selectedRows = Array.from(document.querySelectorAll(".select-row:checked")).map((row) =>
        row.closest("tr")
    );

    if (selectedRows.length === 0) {
        alert(MESSAGES.exportNoSelection);
        return;
    }

    const rows = selectedRows.map((row) =>
        Array.from(row.querySelectorAll("td")).map((cell) => cleanText(cell.innerHTML))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([
        ["NEOWATCH - Veille : Résultats"],
        ["Source", "Contenu", "Actions", "Échéance", "Catégorie"],
        ...rows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veille");
    XLSX.writeFile(workbook, "resultats_veille.xlsx");
};

// **Nettoie le texte HTML**
const cleanText = (text) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
};

// **Event Listeners**
if (searchButton) searchButton.addEventListener("click", () => performGoogleSearch(""));
if (exportXlsButton) exportXlsButton.addEventListener("click", exportToXLS);
