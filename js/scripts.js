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
const userInfoForm = document.getElementById("user-info-form"); // Formulaire utilisateur
const freemiumPlanButton = document.querySelector(".freemium-plan .btn"); // Bouton forfait Freemium
const premiumPlanButton = document.querySelector(".premium-plan .btn"); // Bouton forfait Premium

// Gestion du formulaire utilisateur
if (userInfoForm) {
    userInfoForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Récupération des données du formulaire
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

        // Simule un enregistrement des données (API ou base de données plus tard)
        alert(MESSAGES.successSave);
    });
}

// Gestion des boutons des forfaits
if (freemiumPlanButton) {
    freemiumPlanButton.addEventListener("click", () => {
        alert(`${MESSAGES.planSelection}Freemium`);
        console.log("Forfait Freemium sélectionné");
    });
}

if (premiumPlanButton) {
    premiumPlanButton.addEventListener("click", () => {
        alert(`${MESSAGES.planSelection}Premium`);
        console.log("Forfait Premium sélectionné");
    });
}

// Gérer les paramètres de l'URL pour afficher le bon formulaire
const params = new URLSearchParams(window.location.search);
const section = params.get("section");

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Afficher le bon formulaire en fonction de l'URL
if (section === "register") {
    registerTab.classList.add("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
} else {
    loginTab.classList.add("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
}

// Gestion des clics sur les onglets
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
        // Activer ou désactiver le bouton "S'inscrire" en fonction de la case cochée
        registerButton.disabled = !acceptCgvCheckbox.checked;
    });
}

// Ajout des nouvelles fonctionnalités demandées :

// Gestion de la redirection du bouton "Se connecter"
const loginSubmitButton = document.querySelector("#login-form .btn.primary");
if (loginSubmitButton) {
    loginSubmitButton.addEventListener("click", (event) => {
        event.preventDefault(); // Empêche l'envoi par défaut
        window.location.href = "dashboard.html"; // Redirige vers le tableau de bord
    });
}

// Gestion de la redirection du bouton "S'inscrire"
const registerSubmitButton = document.querySelector("#register-form .btn.primary");
if (registerSubmitButton) {
    registerSubmitButton.addEventListener("click", (event) => {
        event.preventDefault(); // Empêche l'envoi par défaut
        if (acceptCgvCheckbox.checked) {
            window.location.href = "newusers.html"; // Redirige vers la page nouvel utilisateur
        } else {
            alert("Veuillez accepter les conditions générales de vente pour continuer.");
        }
    });
}

// Liaison des cartes filtres à la recherche
document.addEventListener("DOMContentLoaded", () => {
    const filterCards = document.querySelectorAll(".filter-card");
    filterCards.forEach((card) => {
        card.addEventListener("click", () => {
            const filter = card.dataset.filter; // Récupère le filtre
            performGoogleSearch(filter); // Appelle la recherche avec le filtre
        });
    });
});

// Perform Google Search
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

    const apiUrl = `${GOOGLE_SEARCH_API_URL}?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&lr=lang_fr`;

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
    const selectedRows = Array.from(
        document.querySelectorAll(".select-row:checked")
    ).map((row) => row.closest("tr"));

    if (selectedRows.length === 0) {
        alert(MESSAGES.exportNoSelection);
        return;
    }

    const rows = selectedRows.map((row) =>
        Array.from(row.querySelectorAll("td")).map((cell) => cleanText(cell.innerHTML))
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

// Clean Text
const cleanText = (text) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
};

// Event Listeners
if (searchButton) searchButton.addEventListener("click", performGoogleSearch);
if (exportXlsButton) exportXlsButton.addEventListener("click", exportToXLS);
