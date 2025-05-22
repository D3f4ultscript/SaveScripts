// Globale Variablen
let scripts = [];
let scriptNameInput, scriptContentInput, uploadBtn, scriptsListDiv;
let mainPage, rawPage, rawContent;

// Basis-URL für die Raw-Ansicht (ändern Sie dies zu Ihrer GitHub-URL)
const baseUrl = 'https://raw.githubusercontent.com/YourUsername/YourRepo/main/scripts';

// Funktion zum Laden der Scripts aus dem localStorage
function loadScripts() {
    try {
        const savedScripts = localStorage.getItem('scripts');
        if (savedScripts) {
            const parsed = JSON.parse(savedScripts);
            scripts = Array.isArray(parsed) ? parsed : [];
        } else {
            scripts = [];
        }
    } catch (error) {
        console.error('Fehler beim Laden der Scripts:', error);
        scripts = [];
        try {
            localStorage.removeItem('scripts');
        } catch (e) {
            console.error('Konnte localStorage nicht bereinigen:', e);
        }
    }
}

// Funktion zum Anzeigen der Raw-Ansicht
function showRawView(script) {
    mainPage.style.display = 'none';
    rawPage.style.display = 'block';
    rawContent.textContent = script.content;
    
    // Aktualisiere die URL ohne die Seite neu zu laden
    const rawUrl = `${baseUrl}/${script.id}.lua`;
    window.history.pushState({ scriptId: script.id }, '', `/raw/${script.id}`);
}

// Funktion zum Zurückkehren zur Hauptseite
function showMainView() {
    mainPage.style.display = 'block';
    rawPage.style.display = 'none';
    window.history.pushState({}, '', '/');
}

// Funktion zum Anzeigen der Scripts
function displayScripts() {
    if (!scriptsListDiv) {
        console.error('scriptsListDiv nicht gefunden');
        return;
    }
    
    try {
        if (!Array.isArray(scripts)) {
            console.error('scripts ist kein Array, setze zurück');
            scripts = [];
        }

        scriptsListDiv.innerHTML = '';
        
        if (scripts.length === 0) {
            scriptsListDiv.innerHTML = '<p>Noch keine Scripts vorhanden.</p>';
            return;
        }
        
        scripts.forEach(script => {
            const scriptElement = document.createElement('div');
            scriptElement.className = 'script-item';
            
            const safeScriptName = script.name.replace(/[<>]/g, '');
            
            scriptElement.innerHTML = `
                <div class="script-name" onclick="showRawView(${JSON.stringify(script)})">${safeScriptName}</div>
                <div class="script-actions">
                    <button class="btn copy-url-btn" onclick="copyScriptUrl('${script.id}')">Raw URL Kopieren</button>
                    <button class="btn delete-btn" onclick="deleteScript('${script.id}')">Löschen</button>
                </div>
            `;
            
            scriptsListDiv.appendChild(scriptElement);
        });
    } catch (error) {
        console.error('Fehler beim Anzeigen der Scripts:', error);
    }
}

// Funktion zum sicheren Speichern im localStorage
function saveToLocalStorage(key, data) {
    try {
        if (key === 'scripts' && !Array.isArray(data)) {
            console.error('Versuch, nicht-Array in scripts zu speichern');
            return false;
        }
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Fehler beim Speichern in localStorage:', error);
        return false;
    }
}

// Funktion zum Hochladen eines Scripts
function uploadScript() {
    if (!scriptNameInput || !scriptContentInput) {
        console.error('Input-Elemente nicht gefunden');
        return;
    }
    
    try {
        if (!Array.isArray(scripts)) {
            console.error('scripts ist kein Array, initialisiere neu');
            scripts = [];
        }

        const name = scriptNameInput.value.trim();
        const content = scriptContentInput.value.trim();
        
        if (!name || !content) {
            alert('Bitte fülle beide Felder aus!');
            return;
        }

        // Erstelle eine einzigartige ID
        const timestamp = Date.now();
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + timestamp;
        
        const script = {
            id: id,
            name: name,
            content: content,
            timestamp: timestamp
        };

        scripts.push(script);
        
        if (saveToLocalStorage('scripts', scripts)) {
            scriptNameInput.value = '';
            scriptContentInput.value = '';
            displayScripts();
            alert('Script wurde erfolgreich gespeichert!');
        } else {
            throw new Error('Speichern im localStorage fehlgeschlagen');
        }
    } catch (error) {
        console.error('Fehler beim Upload-Prozess:', error);
        alert('Fehler beim Hochladen des Scripts: ' + error.message);
    }
}

// Funktion zum Kopieren der Script-URL
function copyScriptUrl(scriptId) {
    try {
        if (!Array.isArray(scripts)) {
            console.error('scripts ist kein Array beim Kopieren');
            return;
        }

        const script = scripts.find(s => s.id === scriptId);
        if (!script) {
            console.error('Script nicht gefunden:', scriptId);
            alert('Script nicht gefunden!');
            return;
        }
        
        // Erstelle die GitHub-ähnliche Raw-URL
        const rawUrl = `${baseUrl}/${script.id}.lua`;
        
        navigator.clipboard.writeText(rawUrl)
            .then(() => {
                alert('Raw URL wurde in die Zwischenablage kopiert!');
            })
            .catch(err => {
                console.error('Fehler beim Kopieren:', err);
                alert('Fehler beim Kopieren der URL. URL: ' + rawUrl);
            });
    } catch (error) {
        console.error('Fehler beim Erstellen/Kopieren der URL:', error);
        alert('Fehler beim Kopieren der URL.');
    }
}

// Funktion zum Löschen eines Scripts
function deleteScript(scriptId) {
    try {
        if (!Array.isArray(scripts)) {
            console.error('scripts ist kein Array beim Löschen');
            scripts = [];
            return;
        }

        if (confirm('Möchtest du dieses Script wirklich löschen?')) {
            const beforeCount = scripts.length;
            scripts = scripts.filter(script => script.id !== scriptId);
            const afterCount = scripts.length;
            
            if (beforeCount === afterCount) {
                console.error('Script wurde nicht gefunden:', scriptId);
                return;
            }
            
            if (saveToLocalStorage('scripts', scripts)) {
                displayScripts();
            } else {
                throw new Error('Fehler beim Speichern nach dem Löschen');
            }
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen des Scripts.');
    }
}

// Event-Listener für Browser-Navigation
window.addEventListener('popstate', () => {
    if (rawPage.style.display === 'block') {
        showMainView();
    }
});

// Initialisierung
function init() {
    // DOM Elemente initialisieren
    scriptNameInput = document.getElementById('scriptName');
    scriptContentInput = document.getElementById('scriptContent');
    uploadBtn = document.getElementById('uploadBtn');
    scriptsListDiv = document.getElementById('scriptsList');
    mainPage = document.getElementById('mainPage');
    rawPage = document.getElementById('rawPage');
    rawContent = document.getElementById('rawContent');

    // Überprüfe ob alle Elemente vorhanden sind
    if (!scriptNameInput || !scriptContentInput || !uploadBtn || !scriptsListDiv || !mainPage || !rawPage || !rawContent) {
        console.error('Nicht alle erforderlichen Elemente wurden gefunden!');
        return;
    }

    // Event Listener hinzufügen
    uploadBtn.addEventListener('click', uploadScript);

    // Scripts laden und anzeigen
    loadScripts();
    displayScripts();
}

// Stelle sicher, dass die Funktionen global verfügbar sind
window.copyScriptUrl = copyScriptUrl;
window.deleteScript = deleteScript;
window.showRawView = showRawView;
window.showMainView = showMainView;

// Warte bis das DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 