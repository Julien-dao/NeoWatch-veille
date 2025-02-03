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
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportXlsButton = document.getElementById("export-xls-btn");

// Nouveaux éléments pour la page utilisateur
const userInfoForm = document.getElementById("user-info-form");
const freemiumPlanButton = document.querySelector(".freemium-plan .btn");
const premiumPlanButton = document.querySelector(".premium-plan .btn");

// Gestion du formulaire utilisateur
if (userInfoForm) {
    userInfoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(userInfoForm);
        const userData = {
            firstname: formData.get("firstname"),
            lastname: formData.get("lastname"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            profession: formData.get("profession"),
            company: formData.get("company"),
        };
        console.log("Données utilisateur :", userData);
        alert(MESSAGES.successSave);
    });
}

// Gestion des boutons des forfaits
if (freemiumPlanButton) {
    freemiumPlanButton.addEventListener("click", () => {
        alert(`${MESSAGES.planSelection}Freemium`);
    });
}

if (premiumPlanButton) {
    premiumPlanButton.addEventListener("click", () => {
        alert(`${MESSAGES.planSelection}Premium`);
    });
}

// Gérer les paramètres de l'URL pour afficher le bon formulaire
const params = new URLSearchParams(window.location.search);
const section = params.get("section");

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

if (section === "register") {
    registerTab?.classList.add("active");
    registerForm?.style.display = "block";
    loginForm?.style.display = "none";
} else {
    loginTab?.classList.add("active");
    loginForm?.style.display = "block";
    registerForm?.style.display = "none";
}

loginTab?.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
});

registerTab?.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
});

// Gestion de l'activation du bouton "S'inscrire"
const acceptCgvCheckbox = document.getElementById("accept-cgv");
const registerButton = document.getElementById("register-btn");

if (acceptCgvCheckbox && registerButton) {
    acceptCgvCheckbox.addEventListener("change", () => {
        registerButton.disabled = !acceptCgvCheckbox.checked;
    });
}

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

// Perform Google Search avec 20 articles minimum
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

// Parse Results
const parseGoogleSearchResults = (data) => {
    return data.items.map((item) => ({
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
                <td>${result.date}</td>
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

// Clear Table
const clearTable = () => {
    entriesTable.innerHTML = `<tr><td colspan="7">Aucune donnée disponible</td></tr>`;
};

// Export to XLS
const exportToXLS = () => {
    alert("Export en XLS non implémenté !");
};

// Event Listeners
if (searchButton) searchButton.addEventListener("click", () => performGoogleSearch(""));
if (exportXlsButton) exportXlsButton.addEventListener("click", exportToXLS);
