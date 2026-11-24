const form = document.getElementById("entryForm");
const entriesList = document.getElementById("entriesList");
const installButton = document.getElementById("installButton");

const STORAGE_KEY = "diario-de-bordo";

let entries = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

function saveEntries() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
    );
}

function renderEntries() {
    entriesList.replaceChildren();

    if (entries.length === 0) {
        entriesList.textContent = "Nenhuma entrada registrada.";
        return;
    }

    entries.forEach(entry => {
        const card = document.createElement("article");
        card.className = "entry";

        const title = document.createElement("h3");
        title.textContent = entry.title;

        const description = document.createElement("p");
        description.textContent = entry.description;

        const date = document.createElement("small");
        date.textContent = entry.date.split("-").reverse().join("/");

        const button = document.createElement("button");
        button.textContent = "Excluir";
        button.className = "delete-button";

        button.addEventListener("click", () => {
            deleteEntry(entry.id);
        });

        card.append(title, description, date, button);
        entriesList.appendChild(card);
    });
}

function deleteEntry(id) {
    entries = entries.filter(entry => entry.id !== id);

    saveEntries();
    renderEntries();
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value;

    if (!title || !description || !date) {
        alert("Preencha todos os campos.");
        return;
    }

    const entry = {
        id: crypto.randomUUID(),
        title,
        description,
        date
    };

    entries.unshift(entry);

    saveEntries();
    renderEntries();
    form.reset();
});

renderEntries();

// Registro do Service Worker

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => console.log("Service Worker registrado"))
            .catch(error => console.error(error));
    });
}

// Instalação da PWA

let deferredPrompt;

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    deferredPrompt = event;
    installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installButton.hidden = true;
});
