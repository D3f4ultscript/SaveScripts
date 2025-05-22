// Globale Variablen
let scripts = [];
let scriptNameInput, scriptContentInput, uploadBtn, scriptsListDiv;

// Funktion zum Laden der Scripts aus dem localStorage
function loadScripts() {
    try {
        const savedScripts = localStorage.getItem('scripts');
        if (savedScripts) {
            scripts = JSON.parse(savedScripts);
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

// Funktion zum Anzeigen der Scripts
function displayScripts() {
    if (!scriptsListDiv) return;
    
    try {
        scriptsListDiv.innerHTML = '';
        
        if (scripts.length === 0) {
            scriptsListDiv.innerHTML = '<p>Noch keine Scripts vorhanden.</p>';
            return;
        }
        
        scripts.forEach(script => {
            const scriptElement = document.createElement('div');
            scriptElement.className = 'script-item';
            
            scriptElement.innerHTML = `
                <div class="script-name">${script.name}</div>
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

// Funktion zum Hochladen eines Scripts
function uploadScript() {
    if (!scriptNameInput || !scriptContentInput) return;
    
    try {
        const name = scriptNameInput.value.trim();
        const content = scriptContentInput.value.trim();
        
        if (!name || !content) {
            alert('Bitte fülle beide Felder aus!');
            return;
        }

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        const script = {
            id,
            name,
            content,
            timestamp: Date.now()
        };

        scripts.push(script);
        
        try {
            localStorage.setItem('scripts', JSON.stringify(scripts));
            
            scriptNameInput.value = '';
            scriptContentInput.value = '';

            displayScripts();
            alert('Script wurde erfolgreich gespeichert!');
        } catch (storageError) {
            console.error('Fehler beim Speichern:', storageError);
            alert('Fehler beim Speichern: Der Speicher könnte voll sein.');
        }
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        alert('Fehler beim Hochladen des Scripts.');
    }
}

// Funktion zum Kopieren der Script-URL
function copyScriptUrl(scriptId) {
    try {
        const script = scripts.find(s => s.id === scriptId);
        if (!script) {
            alert('Script nicht gefunden!');
            return;
        }
        
        const encodedContent = btoa(unescape(encodeURIComponent(script.content)));
        const rawUrl = `data:text/plain;base64,${encodedContent}`;

        navigator.clipboard.writeText(rawUrl)
            .then(() => alert('Raw URL wurde in die Zwischenablage kopiert!'))
            .catch(err => {
                console.error('Fehler beim Kopieren:', err);
                alert('Fehler beim Kopieren der URL.');
            });
    } catch (error) {
        console.error('Fehler beim Kopieren:', error);
        alert('Fehler beim Kopieren der URL.');
    }
}

// Funktion zum Löschen eines Scripts
function deleteScript(scriptId) {
    try {
        if (confirm('Möchtest du dieses Script wirklich löschen?')) {
            scripts = scripts.filter(script => script.id !== scriptId);
            localStorage.setItem('scripts', JSON.stringify(scripts));
            displayScripts();
        }
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen des Scripts.');
    }
}

// Initialisierung
function init() {
    // DOM Elemente initialisieren
    scriptNameInput = document.getElementById('scriptName');
    scriptContentInput = document.getElementById('scriptContent');
    uploadBtn = document.getElementById('uploadBtn');
    scriptsListDiv = document.getElementById('scriptsList');

    // Überprüfe ob alle Elemente vorhanden sind
    if (!scriptNameInput || !scriptContentInput || !uploadBtn || !scriptsListDiv) {
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

// Warte bis das DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 