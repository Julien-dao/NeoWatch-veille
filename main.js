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

// Vérifie l'existence d'un élément
const checkElement = (element, name) => {
    if (!element) console.warn(`${name} introuvable.`);
};
checkElement(entriesTable, "Élément 'entries-tbody'");
checkElement(searchButton, "Bouton 'search-btn'");
checkElement(exportXlsButton, "Bouton 'export-xls-btn'");

// Nettoie un texte HTML
const cleanText = text => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
};

// Génère une requête Google Search en fonction des filtres sélectionnés
const generateQuery = selectedFilters => {
    const queries = {
        legale: `
            site:.gouv.fr OR 
            Lois sur les organismes de formation en France OR 
            Réglementation Qualiopi en France OR 
            Lois apprentissage en France OR 
            Réforme de la formation professionnelle en France OR 
            Financements publics de la formation en France OR 
            Contrôle des organismes de formation en France OR 
            Obligation légale des formateurs en France
        `,
        competence: `
            site:.fr OR 
            site:opco.fr OR 
            Évolution des métiers de la formation en France OR 
            Métier de formateur en France OR 
            Réforme des certifications professionnelles en France OR 
            Formation des demandeurs d'emploi en France OR 
            Métiers émergents en formation professionnelle en France OR 
            Reconversion professionnelle en France OR 
            Formateur indépendant en France OR 
            Rôle des OPCO en France OR 
            Emploi dans le secteur de la formation en France
        `,
        innovation: `
            Innovation en formation professionnelle en France OR 
            Didactique et numérique en France OR 
            Intelligence artificielle et formation en France OR 
            Utilisation de la réalité virtuelle en formation en France OR 
            Technologie immersive en formation professionnelle en France OR 
            Formation hybride en France OR 
            Microlearning pour adultes en France OR 
            Méthodes d’apprentissage adaptatif en France OR 
            Plateformes de e-learning en France
        `,
        handicap: `
            site:.gouv.fr OR 
            Accessibilité pédagogique en France OR 
            Inclusion des personnes en situation de handicap en formation en France OR 
            Adaptation des formations pour les troubles d’apprentissage en France OR 
            Aides financières pour la formation des personnes handicapées en France OR 
            Formation inclusive pour adultes en France OR 
            Accessibilité numérique en formation en France OR 
            Formation adaptée aux handicaps moteurs en France OR 
            Dispositifs d’accompagnement des apprenants handicapés en France
        `
    };

    return selectedFilters.map(filter => queries[filter]?.trim() || "").join(" ");
};

// Parse les résultats Google Custom Search
const parseGoogleSearchResults = (data, selectedFilters) => {
    // Détermine la catégorie active
    const category = selectedFilters.join(", ");

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
const appendToTable = (results, selectedFilters) => {
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
    entriesTable.innerHTML = `<tr><td colspan="6">Aucune donnée disponible</td></tr>`;
};

// Effectue une recherche via Google Custom Search API
const performGoogleSearch = async () => {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);

    const query = generateQuery(selectedFilters);

    if (!query.trim()) {
        alert(MESSAGES.emptyFilters);
        return;
    }

    // Ajout automatique du filtre de date pour l'année en cours
    const currentYear = new Date().getFullYear();
    const startDate = startDateInput?.value ? ` after:${startDateInput.value}` : ` after:${currentYear}-01-01`;
    const endDate = endDateInput?.value ? ` before:${endDateInput.value}` : "";

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query + startDate + endDate)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&lr=lang_fr`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            alert(MESSAGES.noResults);
            clearTable();
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters);
        appendToTable(results, selectedFilters);
    } catch (error) {
        console.error("Erreur dans performGoogleSearch :", error);
        alert(MESSAGES.errorFetching);
    }
};

// Gère les événements
searchButton.addEventListener("click", performGoogleSearch);
exportXlsButton.addEventListener("click", () => alert("Fonction Export à implémenter."));
