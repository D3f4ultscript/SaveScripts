// Globale Variablen
let scripts = [];
let scriptNameInput, scriptContentInput, uploadBtn, scriptsListDiv;

// Funktion zum Laden der Scripts aus dem localStorage
function loadScripts() {
    try {
        const savedScripts = localStorage.getItem('scripts');
        if (savedScripts) {
            const parsed = JSON.parse(savedScripts);
            // Stelle sicher, dass es ein Array ist
            scripts = Array.isArray(parsed) ? parsed : [];
        } else {
            scripts = [];
        }
        console.log('Scripts geladen:', scripts);
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
    if (!scriptsListDiv) {
        console.error('scriptsListDiv nicht gefunden');
        return;
    }
    
    try {
        // Stelle sicher, dass scripts ein Array ist
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
                <div class="script-name">${safeScriptName}</div>
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
        // Stelle sicher, dass data ein Array ist, wenn es scripts sind
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
    console.log('Upload-Funktion gestartet');
    
    if (!scriptNameInput || !scriptContentInput) {
        console.error('Input-Elemente nicht gefunden');
        return;
    }
    
    try {
        // Stelle sicher, dass scripts ein Array ist
        if (!Array.isArray(scripts)) {
            console.error('scripts ist kein Array, initialisiere neu');
            scripts = [];
        }

        const name = scriptNameInput.value.trim();
        const content = scriptContentInput.value.trim();
        
        console.log('Script-Daten:', { nameLength: name.length, contentLength: content.length });
        
        if (!name || !content) {
            alert('Bitte fülle beide Felder aus!');
            return;
        }

        // Erstelle eine einzigartige ID
        const id = `script_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        
        // Erstelle das Script-Objekt
        const script = {
            id: id,
            name: name,
            content: content,
            timestamp: Date.now()
        };

        console.log('Neues Script-Objekt erstellt:', { id: script.id, name: script.name });

        // Füge das Script zur Liste hinzu
        scripts.push(script);
        console.log('Script zur Liste hinzugefügt, neue Länge:', scripts.length);
        
        // Speichere in localStorage
        if (saveToLocalStorage('scripts', scripts)) {
            console.log('Script erfolgreich gespeichert');
            
            // Leere die Eingabefelder
            scriptNameInput.value = '';
            scriptContentInput.value = '';

            // Aktualisiere die Anzeige
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
    console.log('Versuche URL zu kopieren für Script:', scriptId);
    
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

        // Erstelle eine URL mit dem reinen Script-Inhalt
        const rawUrl = `https://raw.githubusercontent.com/YourUsername/YourRepo/main/scripts/${script.id}.lua`;
        
        // Zeige Dialog mit Anweisungen
        const message = `Kopiere diesen Code für loadstring:\n\nloadstring(game:HttpGet("${rawUrl}"))()`; 
        alert(message);

        // Kopiere den kompletten loadstring-Code
        navigator.clipboard.writeText(`loadstring(game:HttpGet("${rawUrl}"))()`)
            .then(() => {
                console.log('Loadstring-Code erfolgreich kopiert');
            })
            .catch(err => {
                console.error('Fehler beim Kopieren:', err);
                alert('Fehler beim Kopieren des Codes.');
            });

        // Speichere den Script auch als separate Datei
        const scriptContent = script.content;
        const blob = new Blob([scriptContent], { type: 'text/plain' });
        const downloadUrl = URL.createObjectURL(blob);
        
        // Erstelle einen Download-Link
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `${script.id}.lua`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error('Fehler beim Erstellen/Kopieren der URL:', error);
        alert('Fehler beim Kopieren der URL.');
    }
}

// Funktion zum Löschen eines Scripts
function deleteScript(scriptId) {
    console.log('Versuche Script zu löschen:', scriptId);
    
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
                console.log('Script erfolgreich gelöscht');
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

// Initialisierung
function init() {
    console.log('Initialisierung gestartet');
    
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

    console.log('Alle DOM-Elemente gefunden');

    // Event Listener hinzufügen
    uploadBtn.addEventListener('click', uploadScript);
    console.log('Event Listener hinzugefügt');

    // Scripts laden und anzeigen
    loadScripts();
    displayScripts();
    console.log('Initialisierung abgeschlossen');
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