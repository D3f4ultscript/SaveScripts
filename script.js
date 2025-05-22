// Globale Variablen
let scripts = JSON.parse(localStorage.getItem('scripts')) || [];
let scriptNameInput, scriptContentInput, uploadBtn, scriptsListDiv;
let mainPage, rawPage, rawContent;

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
    // Zeige den Script-Inhalt in der Raw-Ansicht
    rawContent.textContent = script.content;
    
    // Aktualisiere die URL
    const rawUrl = `/raw/${script.id}`;
    window.history.pushState({ scriptId: script.id }, '', rawUrl);
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

// Funktion zum Generieren eines zufälligen Hashes
function generateHash() {
    const characters = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 128; i++) {
        hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return hash;
}

// Funktion zum Hochladen eines Scripts
function uploadScript() {
    const content = document.getElementById('scriptContent').value.trim();
    
    if (!content) {
        alert('Please paste a script first!');
        return;
    }

    // Generiere einen zufälligen Hash für die URL
    const hash = generateHash();
    
    // Speichere den Script im localStorage
    const scripts = JSON.parse(localStorage.getItem('scripts') || '{}');
    scripts[hash] = content;
    localStorage.setItem('scripts', JSON.stringify(scripts));
    
    // Generiere die URL
    const scriptUrl = `http://sunny-5n92.onrender.com/raw/${hash}`;
    
    // Zeige die URL an
    const scriptLinkDiv = document.getElementById('scriptLink');
    scriptLinkDiv.textContent = scriptUrl;
    scriptLinkDiv.style.display = 'block';
}

// Funktion zum Kopieren des Links
function copyLink() {
    const scriptLinkDiv = document.getElementById('scriptLink');
    const text = scriptLinkDiv.textContent;
    
    if (!text) return;
    
    navigator.clipboard.writeText(text)
        .then(() => {
            const copyBtn = document.querySelector('.copy-btn');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
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
        
        // Erstelle die vollständige URL für den loadstring
        const currentUrl = window.location.origin;
        const rawUrl = `${currentUrl}/raw/${script.id}`;
        const loadstringCode = `loadstring(game:HttpGet("${rawUrl}"))()`;
        
        // Kopiere den loadstring-Code
        navigator.clipboard.writeText(loadstringCode)
            .then(() => {
                alert('Loadstring wurde in die Zwischenablage kopiert!');
            })
            .catch(err => {
                console.error('Fehler beim Kopieren:', err);
                alert('Fehler beim Kopieren. Code zum manuellen Kopieren:\n\n' + loadstringCode);
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

// Funktion zum Laden eines spezifischen Scripts aus der URL
function loadScriptFromUrl() {
    const path = window.location.pathname;
    if (path.startsWith('/raw/')) {
        const scriptId = path.replace('/raw/', '');
        const script = scripts.find(s => s.id === scriptId);
        if (script) {
            showRawView(script);
        }
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
    
    // Prüfe, ob ein spezifischer Script geladen werden soll
    loadScriptFromUrl();
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

// Prüfe, ob wir auf einer Script-Seite sind
const path = window.location.pathname;
if (path.startsWith('/script/')) {
    const hash = path.split('/').pop();
    const scripts = JSON.parse(localStorage.getItem('scripts') || '{}');
    const content = scripts[hash];
    
    if (content) {
        // Zeige NUR den Script-Inhalt ohne HTML-Formatierung
        document.documentElement.innerHTML = content;
    } else {
        document.body.innerHTML = '<h1 style="text-align: center; padding: 20px;">Script nicht gefunden</h1>';
    }
} 