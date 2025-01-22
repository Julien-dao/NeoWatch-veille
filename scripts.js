// Ciblage des éléments du DOM
const filters = document.querySelectorAll(".filters input[type='checkbox']");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const searchButton = document.getElementById("search-btn");
const entriesTable = document.getElementById("entries-tbody");
const exportPdfButton = document.getElementById("export-pdf-btn");
const exportXlsButton = document.getElementById("export-xls-btn");

// Configuration de l'API Google Custom Search
const googleApiKey = "AIzaSyDbcwk2XlpO_IET7xi8_3rksFNdfNKh9iM";
const googleSearchEngineId = "076048ef2f0074904";

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

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    const query = generateQuery(selectedFilters);

    if (!query.trim()) {
        alert("Veuillez sélectionner au moins un filtre ou fournir des critères valides.");
        return;
    }

    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
    )}&key=${googleApiKey}&cx=${googleSearchEngineId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            alert("Aucun résultat trouvé pour votre recherche.");
            updateTable([]);
            return;
        }

        const results = parseGoogleSearchResults(data, selectedFilters);
        updateTable(results);
    } catch (error) {
        alert("Une erreur s'est produite. Veuillez réessayer.");
        console.error("Erreur lors de la recherche :", error);
    }
}

// Fonction pour générer la requête en fonction des filtres sélectionnés
function generateQuery(filters) {
    let query = "";
    if (filters.includes("legale")) {
        query += "Lois sur la formation professionnelle OR droit du travail OR subventions ";
    }
    if (filters.includes("competence")) {
        query += '"reconversion professionnelle" OR "évolution des métiers" OR "formations certifiantes" site:francetravail.fr OR site:opco.fr OR site:travail.gouv.fr ';
    }
    if (filters.includes("innovation")) {
        query += '"intelligence artificielle" OR "e-learning" OR "microlearning" OR "nouveaux outils en formation" ';
    }
    if (filters.includes("handicap")) {
        query += '"Accessibilité numérique" OR "troubles apprentissage" OR "aides financières" site:agefiph.fr OR site:fiphfp.fr OR site:francetravail.fr ';
    }
    return query.trim();
}

// Fonction pour parser les résultats de Google Custom Search
function parseGoogleSearchResults(data, filters) {
    return data.items.map(item => ({
        date: item.pagemap?.metatags?.[0]["article:published_time"] || "Non disponible",
        source: `<a href="${item.link}" target="_blank">${item.displayLink}</a>`,
        content: item.snippet || "Résumé non disponible",
        action: generateActionList(),
        deadline: '<input type="date" class="deadline-input">',
        category: filters.join(", ") || "Non catégorisé",
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

// Fonction pour mettre à jour la table avec les résultats
function updateTable(results) {
    entriesTable.innerHTML = "";

    if (results.length === 0) {
        entriesTable.innerHTML = `<tr><td colspan="7">Aucun résultat disponible.</td></tr>`;
        return;
    }

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

// Gestionnaire pour ajouter une nouvelle tâche
function handleAddAction(event) {
    const newAction = prompt("Ajoutez une nouvelle action :");
    if (newAction) {
        const todoList = event.target.closest(".todo-list");
        const newItem = `<li><input type="checkbox"> ${newAction}</li>`;
        todoList.insertAdjacentHTML("beforeend", newItem);
    }
}

// Fonction pour exporter en PDF
function exportToPDF() {
    const selectedRows = Array.from(document.querySelectorAll(".select-row:checked")).map(row =>
        row.closest("tr")
    );

    if (selectedRows.length === 0) {
        alert("Veuillez sélectionner au moins une entrée pour l'exportation.");
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("NEOWATCH - VEILLE : Votre veille professionnelle en 3 clics", 10, 10);

    let y = 30;
    selectedRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const rowData = Array.from(cells).map(cell => cleanText(cell.innerHTML));
        doc.text(rowData.join(" | "), 10, y);
        y += 10;
    });

    doc.save("export.pdf");
}

// Fonction pour exporter en XLS
function exportToXLS() {
    const selectedRows = Array.from(document.querySelectorAll(".select-row:checked")).map(row =>
        row.closest("tr")
    );

    if (selectedRows.length === 0) {
        alert("Veuillez sélectionner au moins une entrée pour l'exportation.");
        return;
    }

    const rows = selectedRows.map(row => {
        return Array.from(row.querySelectorAll("td")).map(cell => cleanText(cell.innerHTML));
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
        ["NEOWATCH - VEILLE : Votre veille professionnelle en 3 clics"],
        [],
        ["Sélection", "Date", "Source", "Contenu", "Action", "Échéance", "Catégorie"],
        ...rows
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veille");
    XLSX.writeFile(workbook, "export.xlsx");
}

// Ajout des gestionnaires d'événements
searchButton.addEventListener("click", performGoogleSearch);
exportPdfButton.addEventListener("click", exportToPDF);
exportXlsButton.addEventListener("click", exportToXLS);
