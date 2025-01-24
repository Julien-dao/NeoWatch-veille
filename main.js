// Configuration
const GOOGLE_API_KEY = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const GOOGLE_SEARCH_ENGINE_ID = "076048ef2f0074904";
const GOOGLE_SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1";

// Messages
const MESSAGES = {
    noResults: "Aucun résultat trouvé pour votre recherche.",
    errorFetching: "Une erreur s'est produite lors de la récupération des données.",
    emptyFilters: "Veuillez sélectionner un filtre valide.",
};

// DOM Elements
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");

// Vérifie l'existence d'un élément
const checkElement = (element, name) => {
    if (!element) console.warn(`${name} introuvable.`);
};
checkElement(entriesTable, "Élément 'entries-tbody'");
checkElement(exportXlsButton, "Bouton 'export-xls-btn'");

// Nettoie un texte HTML
const cleanText = text => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
};

// Génère une requête Google Search en fonction du filtre sélectionné
const generateQuery = selectedFilter => {
    const queries = {
        legale: "Lois sur les organismes de formation en France OR Réglementation Qualiopi en France",
        competence: "Évolution des métiers de la formation en France OR Métier de formateur en France",
        innovation: "Innovation pédagogique et technologique en France OR Intelligence artificielle en formation",
        handicap: "Accessibilité pédagogique en France OR Inclusion des personnes handicapées en formation",
        financement: "CPF en France OR Aides financières pour la formation en France",
        evaluation: "Évaluation des compétences professionnelles en France OR Certification Qualiopi en France",
        reformes: "Réforme de la formation professionnelle en France OR Politiques publiques pour la formation",
        developpement_durable: "Formation aux métiers de la transition écologique en France OR Développement durable et formation",
    };
    return queries[selectedFilter] || "";
};

// Calcule la plage de dates pour les 24 derniers mois
const calculateDateRange = () => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 24);
    const startDateISO = startDate.toISOString().split("T")[0];

    return { startDate: startDateISO, endDate };
};

// Parse les résultats Google Custom Search
const parseGoogleSearchResults = (data, category) => {
    return data.items.map(item => ({
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: category || "Non catégorisé",
    }));
};

// Génère la liste des actions possibles
const generateActionList = () => `
    <ul class="todo-list">
        <li><button class="save-action">Enregistrer</button></li>
    </ul>
`;

// Met à jour le tableau avec les résultats
const appendToTable = (results) => {
    if (!results || results.length === 0) {
        clearTable();
        alert(MESSAGES.noResults);
        return;
    }

    entriesTable.innerHTML = results
        .map(result => `
            <tr>
                <td><input type="checkbox" class="select-row"></td>
                <td>${result.source}</td>
                <td>${result.content}</td>
                <td>${result.action}</td>
                <td>${result.deadline}</td>
                <td>${result.category}</td>
            </tr>
        `)
        .join("");

    document.querySelectorAll(".save-action").forEach((button, index) => {
        button.addEventListener("click", () => saveEntry(results[index]));
    });
};

// Sauvegarde une entrée dans le stockage local
const saveEntry = entry => {
    const savedEntries = JSON.parse(localStorage.getItem("savedEntries")) || [];
    savedEntries.push({
        source: entry.source,
        content: entry.content,
        action: "Enregistré",
        deadline: "À définir",
        category: entry.category,
    });
    localStorage.setItem("savedEntries", JSON.stringify(savedEntries));
    alert("Article enregistré avec succès !");
};

// Efface le contenu du tableau
const clearTable = () => {
    entriesTable.innerHTML = `<tr><td colspan="5">Aucune donnée disponible</td></tr>`;
};

// Effectue une recherche via Google Custom Search API
const performGoogleSearch = async (selectedFilter) => {
    if (!selectedFilter) {
        alert(MESSAGES.emptyFilters);
        return;
    }

    const query = generateQuery(selectedFilter);
    const { startDate, endDate } = calculateDateRange();

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query + ` after:${startDate} before:${endDate}`)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&lr=lang_fr`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            alert(MESSAGES.noResults);
            clearTable();
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1));
        appendToTable(results);
    } catch (error) {
        console.error("Erreur dans performGoogleSearch :", error);
        alert(MESSAGES.errorFetching);
    }
};

// Gestion des clics sur les cartes
document.querySelectorAll(".filter-card").forEach(card => {
    card.addEventListener("click", event => {
        const selectedFilter = event.target.getAttribute("data-filter");
        performGoogleSearch(selectedFilter);
    });
});

// Exporter les résultats en XLS
exportXlsButton.addEventListener("click", () => alert("Fonction Export à implémenter."));
