// Configuration
const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const GOOGLE_SEARCH_ENGINE_ID = "076048ef2f0074904";
const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";

// Messages
const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner au moins un filtre ou fournir des critères valides.",
    exportNoSelection: "Veuillez sélectionner au moins une entrée pour l'exportation.",
};

// DOM Elements
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");

// Nouveaux éléments pour l'authentification
const loginButton = document.getElementById("login-btn"); // Bouton Se connecter
const registerButton = document.getElementById("register-btn"); // Bouton Créer un compte
const acceptCgvCheckbox = document.getElementById("accept-cgv"); // Case à cocher CGV
const registerSubmitButton = document.getElementById("register-btn"); // Bouton "S'inscrire"

// Gestion des redirections pour les boutons "Se connecter" et "Créer un compte"
if (loginButton) {
    loginButton.addEventListener("click", () => {
        window.location.href = "authentification.html?section=login"; // Redirection vers la section connexion
    });
}

if (registerButton) {
    registerButton.addEventListener("click", () => {
        window.location.href = "authentification.html?section=register"; // Redirection vers la section inscription
    });
}

// Gestion des onglets (connexion/inscription) sur la page authentification.html
const params = new URLSearchParams(window.location.search);
const section = params.get("section");

if (section === "register" && document.getElementById("register-tab")) {
    // Active l'onglet "Créer un compte" si l'URL contient section=register
    document.getElementById("register-tab").click();
} else if (section === "login" && document.getElementById("login-tab")) {
    // Active l'onglet "Se connecter" si l'URL contient section=login (par défaut)
    document.getElementById("login-tab").click();
}

// Gestion de l'activation du bouton "S'inscrire" en fonction de la case CGV
if (acceptCgvCheckbox && registerSubmitButton) {
    registerSubmitButton.disabled = true; // Désactiver par défaut
    acceptCgvCheckbox.addEventListener("change", () => {
        registerSubmitButton.disabled = !acceptCgvCheckbox.checked; // Activer/désactiver selon la case
    });
}

// Check Elements
const checkElement = (element, name) => {
    if (!element) console.warn(`${name} introuvable.`);
};
checkElement(entriesTable, "Élément 'entries-tbody'");
checkElement(searchButton, "Bouton 'search-btn'");
checkElement(exportXlsButton, "Bouton 'export-xls-btn'");

// Clean Text
const cleanText = text => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
};

// Generate Query
const generateQuery = selectedFilters => {
    const queries = {
        legale: "Lois OR réglementation",
        competence: "Évolution des métiers",
        innovation: "Technologie OR IA",
        handicap: "Accessibilité",
    };
    return selectedFilters.map(filter => queries[filter] || "").join(" ");
};

// Parse Results
const parseGoogleSearchResults = data => {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]?.["article:published_time"] || "Non disponible",
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: "Non catégorisé",
    }));
};

// Generate Actions
const generateActionList = () => `
    <ul class="todo-list">
        <li><input type="checkbox"> Lire</li>
        <li><input type="checkbox"> Partager</li>
        <li><input type="checkbox"> Enregistrer</li>
    </ul>
`;

// Update Table
const appendToTable = results => {
    if (!results || results.length === 0) {
        clearTable();
        alert(MESSAGES.noResults);
        return;
    }

    entriesTable.innerHTML = results
        .map(result => `
            <tr>
                <td><input type="checkbox" class="select-row"></td>
                <td>${result.date}</td>
                <td>${result.source}</td>
                <td>${result.content}</td>
                <td>${result.action}</td>
                <td>${result.deadline}</td>
                <td>${result.category}</td>
            </tr>
        `)
        .join("");
};

// Clear Table
const clearTable = () => {
    entriesTable.innerHTML = `<tr><td colspan="7">Aucune donnée disponible</td></tr>`;
};

// Perform Google Search
const performGoogleSearch = async () => {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);
    const query = generateQuery(selectedFilters);

    if (!query.trim()) {
        alert(MESSAGES.emptyFilters);
        return;
    }

    const startDate = startDateInput?.value ? ` after:${startDateInput.value}` : "";
    const endDate = endDateInput?.value ? ` before:${endDateInput.value}` : "";

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query + startDate + endDate)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&lr=lang_fr`;

    console.log("Requête générée :", apiUrl);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        
        const data = await response.json();
        console.log("Réponse API :", data);

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

// Export to XLS
const exportToXLS = () => {
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
        ["NEOWATCH - Veille : Résultats"],
        ["Date", "Source", "Contenu", "Actions", "Échéance", "Catégorie"],
        ...rows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veille");
    XLSX.writeFile(workbook, "resultats_veille.xlsx");
};

// Event Listeners
searchButton.addEventListener("click", performGoogleSearch);
exportXlsButton.addEventListener("click", exportToXLS);
