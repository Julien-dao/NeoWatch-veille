// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");

// Configuration de l'API Google Custom Search
const googleApiKey = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const googleSearchEngineId = "076048ef2f0074904";

// Fonction pour effectuer une recherche via l'API Google Custom Search
async function performGoogleSearch() {
    const selectedFilters = Array.from(filters)
        .filter(filter => filter.checked)
        .map(filter => filter.value);

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Génération de mots-clés spécifiques pour chaque filtre
    let query = "";
    if (selectedFilters.includes("legale")) {
        query += "Lois sur la formation professionnelle, droit du travail, subventions, Lois sur les CFA, nouvelle loi formation professionnelle ";
    }
    if (selectedFilters.includes("competence")) {
        query += '"reconversion professionnelle", "évolution des métiers", "formations certifiantes" site:francetravail.fr OR site:opco.fr OR site:travail.gouv.fr ';
    }
    if (selectedFilters.includes("innovation")) {
        query += '"intelligence artificielle", "e-learning", "microlearning", "nouveaux outils en formation", "méthodes pédagogiques innovantes" ';
    }
    if (selectedFilters.includes("handicap")) {
        query += '"Accessibilité numérique", "dispositifs pour les troubles de l’apprentissage", "aides financières" site:agefiph.fr OR site:fiphfp.fr OR site:francetravail.fr ';
    }

    // Si aucun filtre n'est sélectionné, utiliser une requête par défaut
    if (!query.trim()) {
        query = "veille formation pour organisme de formation";
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
    )}&key=${googleApiKey}&cx=${googleSearchEngineId}`;

    try {
        console.log("Requête générée : ", query);
        const response = await fetch(apiUrl);

        // Vérifie si la réponse est correcte
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        console.log("Structure complète des données reçues : ", JSON.stringify(data, null, 2));

        // Vérifie si les résultats sont exploitables
        if (!data.items || data.items.length === 0) {
            alert("Aucun résultat trouvé pour votre recherche.");
            updateTable([]); // Affiche un message dans le tableau
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters);
        console.log("Résultats parsés : ", results);

        updateTable(results);
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        alert("Une erreur s'est produite lors de la recherche. Vérifiez votre connexion ou réessayez.");
    }
}

// Fonction pour parser les résultats de Google Custom Search
function parseGoogleSearchResults(data, filters) {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]["article:published_time"] || "Non disponible",
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`, // Lien vers l'article
        content: item.snippet || "Résumé non disponible",
        action: `<ul class="todo-list">
                    <li><input type="checkbox"> Lire</li>
                    <li><input type="checkbox"> Partager</li>
                    <li><input type="checkbox"> Enregistrer</li>
                    <li><button class="add-action">Ajouter</button></li>
                 </ul>`,
        deadline: "Non définie", // Date d'échéance (modifiable)
        category: filters.join(", ") || "Non catégorisé"
    }));
}

// Fonction pour mettre à jour la table avec les résultats
function updateTable(results) {
    entriesTable.innerHTML = ""; // Vide les entrées existantes

    if (results.length === 0) {
        const row = `<tr><td colspan="6">Aucun résultat disponible.</td></tr>`;
        entriesTable.insertAdjacentHTML("beforeend", row);
        return;
    }

    results.forEach(result => {
        const row = `
            <tr>
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

    // Ajout des événements pour la liste des actions
    document.querySelectorAll(".add-action").forEach(button => {
        button.addEventListener("click", event => {
            const newAction = prompt("Ajoutez une nouvelle action :");
            if (newAction) {
                const todoList = event.target.closest(".todo-list");
                const newItem = `<li><input type="checkbox"> ${newAction}</li>`;
                todoList.insertAdjacentHTML("beforeend", newItem);
            }
        });
    });
}

// Ajout d'un événement au bouton "Rechercher"
searchButton.addEventListener("click", performGoogleSearch);
