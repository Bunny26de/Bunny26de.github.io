// script.js

/**
 * Funktion zum Umschalten des Hamburger-Menüs (Öffnen/Schließen).
 * Aktualisiert auch ARIA-Attribute für Barrierefreiheit.
 */
function toggleMenu() {
    const menu = document.querySelector("#hamburger-nav .menu-links");
    const icon = document.querySelector("#hamburger-nav .hamburger-icon");

    if (menu && icon) { // Sicherstellen, dass die Elemente existieren
        menu.classList.toggle("open");
        icon.classList.toggle("open");
        const isExpanded = menu.classList.contains("open");
        icon.setAttribute("aria-expanded", isExpanded.toString());
    } else {
        console.error("Hamburger-Menü oder Icon nicht gefunden.");
    }
}

/**
 * Passt das obere Padding des Body-Elements dynamisch an die Höhe
 * der fixierten Navigation an, um Überlappung zu vermeiden.
 */
function adjustBodyPadding() {
    const desktopNav = document.getElementById('desktop-nav');
    const hamburgerNav = document.getElementById('hamburger-nav');
    let navHeight = 0;

    if (desktopNav && getComputedStyle(desktopNav).display !== 'none' && getComputedStyle(desktopNav).position === 'fixed') {
        navHeight = desktopNav.offsetHeight;
    } else if (hamburgerNav && getComputedStyle(hamburgerNav).display !== 'none' && getComputedStyle(hamburgerNav).position === 'fixed') {
        navHeight = hamburgerNav.offsetHeight;
    }
    document.body.style.paddingTop = navHeight + 'px';
}

/**
 * Sammelt alle Formulardaten und formatiert sie als String
 * für die Ausgabe oder den Download.
 * @returns {string | null} Ein formatierter String oder null bei Fehler.
 */
function collectAndFormatFormData() {
    const form = document.getElementById('bewerbungsformular');
    if (!form) {
        console.error("Formular mit ID 'bewerbungsformular' nicht gefunden.");
        return null;
    }

    const formData = new FormData(form);
    let outputText = "Bewerbung für das Zuhör-Projekt\n";
    outputText += "=====================================\n\n";

    // Hilfsfunktion zum sicheren Abrufen von Formularwerten
    const getVal = (name) => formData.get(name) || 'N/A';
    const getRadioLabel = (name, value) => {
        if (!value) return 'N/A';
        const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
        return radio && radio.parentElement ? radio.parentElement.textContent.trim().split('\n')[0] : value;
    };
    const getCheckboxLabels = (name) => {
        const labels = [];
        form.querySelectorAll(`input[name="${name}"]:checked`).forEach(cb => {
            if (cb.parentElement) labels.push(cb.parentElement.textContent.trim());
        });
        return labels.length > 0 ? labels.join(', ') : 'Keine ausgewählt';
    };
    const formatTextareaForOutput = (name) => (formData.get(name) || 'N/A'); // Keine > für reinen Text

    // --- Teil 1: Allgemeine Angaben ---
    outputText += "Teil 1: Allgemeine Angaben\n";
    outputText += `  Vor- und Nachname: ${getVal('name')}\n`;
    outputText += `  E-Mail-Adresse: ${getVal('email')}\n`;
    outputText += `  Alter: ${getVal('alter')}\n`;
    outputText += `  Beruf / Ausbildung: ${getVal('beruf')}\n`;
    outputText += `  Bisherige Erfahrungen:\n    ${formatTextareaForOutput('erfahrungen_beratung').replace(/\n/g, '\n    ')}\n\n`;

    // --- Teil 2: Selbsteinschätzung ---
    outputText += "Teil 2: Selbsteinschätzung\n";
    const assessmentTable = form.querySelector('.assessment-table tbody');
    if (assessmentTable) {
        for (let i = 0; i < assessmentTable.rows.length; i++) {
            const row = assessmentTable.rows[i];
            const questionText = row.cells[0] ? row.cells[0].textContent.trim() : `Frage ${i + 1}`;
            const radioName = `selbst${i + 1}`;
            const value = getVal(radioName);
            outputText += `  ${questionText}: ${value || 'Nicht beantwortet'}\n`;
        }
    } else {
        console.warn("Bewertungstabelle (.assessment-table tbody) nicht gefunden.");
    }
    outputText += "\n";
    
    // --- Teil 3: Reflexionsfragen ---
    outputText += "Teil 3: Reflexionsfragen\n";
    const reflexionFields = [
        { id: 'reflexion_motivation', label: 'Was motiviert dich, an diesem Projekt teilzunehmen?' },
        { id: 'reflexion_umgang', label: 'Was ist dir besonders wichtig im Umgang mit anderen Menschen?' },
        { id: 'reflexion_wut', label: 'Wie reagierst du, wenn du das Gefühl hast, jemand projiziert seine Wut auf dich?' },
        { id: 'reflexion_beistand', label: 'Beschreibe eine Situation, in der du jemandem erfolgreich beigestanden hast.' },
        { id: 'reflexion_selbsthilfe', label: 'Wie erkennst du, dass du selbst Unterstützung brauchst – und was tust du dann?' },
        { id: 'reflexion_haltung', label: 'Welche Haltung möchtest du in Gesprächen vertreten (z.B. Neutralität, Mitgefühl, Lösungsorientierung)?' },
        { id: 'reflexion_schwere_zeit', label: 'Was würdest du tun, wenn du selbst gerade eine schwere Zeit hast – kannst du dann trotzdem Gespräche führen?' }
    ];
    reflexionFields.forEach(field => {
        outputText += `  ${field.label}\n    ${formatTextareaForOutput(field.id).replace(/\n/g, '\n    ')}\n\n`;
    });

    // --- Teil 4: Einschätzungsfragen ---
    outputText += "Teil 4: Einschätzungsfragen\n";
    const themaZuNahValue = getVal('thema_zu_nah');
    let themaZuNahText = 'N/A';
    if (themaZuNahValue === 'd_text') {
        themaZuNahText = `Sonstiges: ${getVal('thema_zu_nah_sonstiges_text')}`;
    } else if (themaZuNahValue !== 'N/A') {
        themaZuNahText = getRadioLabel('thema_zu_nah', themaZuNahValue);
    }
    outputText += `  Was tust du, wenn dir während eines Gesprächs ein Thema zu nah geht? ${themaZuNahText}\n`;
    outputText += `  Wie würdest du reagieren, wenn jemand im Gespräch Suizidgedanken äußert?\n    ${formatTextareaForOutput('einschatzung_suizid').replace(/\n/g, '\n    ')}\n`;
    outputText += `  In welchen Themen fühlst du dich eher unsicher? ${getCheckboxLabels('unsichere_themen[]')}\n`;

    const weiterbildungValue = getVal('weiterbildung');
    let weiterbildungText = 'N/A';
    if (weiterbildungValue === 'bestimmte') {
        weiterbildungText = `Nur in bestimmten Themen: ${getVal('weiterbildung_themen_spezifisch_text')}`;
    } else if (weiterbildungValue !== 'N/A') {
        weiterbildungText = getRadioLabel('weiterbildung', weiterbildungValue);
    }
    outputText += `  Wärst du bereit, dich in diesen Bereichen weiterzubilden? ${weiterbildungText}\n\n`;

    // --- Teil 5: Verfügbarkeit & Rahmenbedingungen ---
    outputText += "Teil 5: Verfügbarkeit & Rahmenbedingungen\n";
    outputText += `  Wie viel Zeit könntest du pro Woche aufbringen? ${getRadioLabel('zeit_pro_woche', getVal('zeit_pro_woche'))}\n`;
    outputText += `  Wann bist du vorrangig verfügbar? ${getCheckboxLabels('verfuegbarkeit_wann[]')}\n`;
    outputText += `  Bist du bereit, an einer vorbereitenden Schulung teilzunehmen? ${getRadioLabel('schulung_teilnahme', getVal('schulung_teilnahme'))}\n\n`;

    // --- Weitere Reflexionsfragen ---
    outputText += "Weitere Reflexionsfragen\n";
    const weitereFragenFields = [
        { id: 'zusatz_zuhoren_bedeutung', label: 'Was bedeutet für dich „zuhören“?' },
        { id: 'zusatz_motivation_begleitung', label: 'Warum möchtest du Menschen in schwierigen Situationen begleiten?' },
        { id: 'zusatz_guter_zuhoerer', label: 'In welchen Situationen fühlst du dich als besonders guter Zuhörer?' },
        { id: 'zusatz_themen_herz', label: 'Welche Themen liegen dir besonders am Herzen?' },
        { id: 'zusatz_staerken_kontakt', label: 'Was sind deine größten Stärken in zwischenmenschlichen Kontakten?' },
        { id: 'zusatz_umgang_gefuehle', label: 'Wie gehst du mit eigenen Gefühlen um, wenn du schwierige Dinge hörst?' },
        { id: 'zusatz_reaktion_ueberforderung', label: 'Wie reagierst du, wenn du dich überfordert oder hilflos fühlst?' },
        { id: 'zusatz_abgrenzung', label: 'Was tust du konkret, um dich emotional abzugrenzen?' },
        { id: 'zusatz_belastende_themen', label: 'Gibt es Themen, die dich persönlich sehr stark belasten?' },
        { id: 'zusatz_psych_wohlbefinden', label: 'Wie sorgst du für dein eigenes psychisches Wohlbefinden?' },
        { id: 'zusatz_reaktion_still_ablehnend', label: 'Wie würdest du reagieren, wenn jemand sehr still oder ablehnend ist?' },
        { id: 'zusatz_mitfuehlen_loesung', label: 'Was ist dir wichtiger: mitzufühlen oder Lösungen anzubieten?' },
        { id: 'zusatz_umgang_widerspruch_werte', label: 'Wie gehst du mit Meinungen um, die deinen eigenen Werten widersprechen?' },
        { id: 'zusatz_ratschlaege_wann', label: 'Wann gibst du Ratschläge – und wann eher nicht?' },
        { id: 'zusatz_hilfe_selbsthilfe', label: 'Was verstehst du unter „Hilfe zur Selbsthilfe“?' },
        { id: 'zusatz_reaktion_weinen', label: 'Was würdest du tun, wenn jemand während des Gesprächs weint?' },
        { id: 'zusatz_reaktion_wut_person', label: 'Wie reagierst du, wenn jemand sehr wütend wird?' },
        { id: 'zusatz_nicht_weiterkommen', label: 'Was machst du, wenn du das Gefühl hast, nicht weiterzukommen?' },
        { id: 'zusatz_umgang_schweigen', label: 'Wie gehst du mit Schweigen in Gesprächen um?' },
        { id: 'zusatz_reaktion_suizid_person', label: 'Was wäre deine Reaktion, wenn dir jemand Suizidgedanken anvertraut?' },
        { id: 'zusatz_grenzen_verantwortung', label: 'Wo liegen für dich die Grenzen deiner Verantwortung?' },
        { id: 'zusatz_entscheidung_weiterleitung', label: 'Wie würdest du entscheiden, wann du eine Person an professionelle Hilfe weiterleitest?' },
        { id: 'zusatz_warnzeichen_prof_hilfe', label: 'Was sind klare Warnzeichen, dass jemand dringend professionelle Unterstützung braucht?' },
        { id: 'zusatz_vertraulichkeit', label: 'Was verstehst du unter „Vertraulichkeit“ – und wo hat sie Grenzen?' },
        { id: 'zusatz_team_reflexion', label: 'Wärst du bereit, im Team über schwierige Fälle zu reflektieren?' },
        { id: 'zusatz_kritikfaehigkeit', label: 'Wie gut kannst du Kritik annehmen und verarbeiten?' },
        { id: 'zusatz_austausch_gruppe', label: 'Wie wichtig ist dir Austausch mit anderen in der Gruppe?' },
        { id: 'zusatz_erwartung_team', label: 'Was erwartest du von einem guten Team?' },
        { id: 'zusatz_kompetenzen_verbessern', label: 'Welche Kompetenzen würdest du gerne noch verbessern?' },
        { id: 'zusatz_teilnahme_fortbildung', label: 'Bist du bereit, an regelmäßigen Fortbildungen oder Supervisionen teilzunehmen?' }
    ];
    weitereFragenFields.forEach(field => {
        outputText += `  ${field.label}\n    ${formatTextareaForOutput(field.id).replace(/\n/g, '\n    ')}\n\n`;
    });

    // --- Abschlussfrage ---
    const abschlussMitgeben = getVal('abschluss_mitgeben');
    if (abschlussMitgeben !== 'N/A' && abschlussMitgeben.trim() !== '') {
        outputText += "Abschlussfrage (optional):\n";
        outputText += `    ${formatTextareaForOutput('abschluss_mitgeben').replace(/\n/g, '\n    ')}\n\n`;
    }
    
    return outputText;
}

/**
 * Zeigt die gesammelten Formulardaten in einem neuen Tab an oder bietet sie als TXT-Download an.
 */
function handlePrepareForDiscord() {
    const formattedData = collectAndFormatFormData();
    if (!formattedData) {
        alert("Fehler: Keine Daten zum Vorbereiten gefunden oder Formular nicht korrekt initialisiert.");
        return;
    }

    const submitButton = document.getElementById('prepareForDiscordBtn');
    if (!submitButton) {
        console.error("Button ('prepareForDiscordBtn') nicht gefunden.");
        alert("Ein interner Fehler ist aufgetreten (Button nicht gefunden).");
        return;
    }
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Bereite vor...';
    submitButton.disabled = true;

    // Option 1: In neuem Tab anzeigen (einfacher für Copy & Paste)
    const newTab = window.open();
    if (newTab) {
        newTab.document.open();
        newTab.document.write('<pre>' + escapeHtml(formattedData) + '</pre>'); // <pre> für Formatierung, escapeHtml für Sicherheit
        newTab.document.close();
        alert("Die Daten wurden in einem neuen Tab geöffnet. Bitte kopiere den Text und füge ihn in Discord ein.");
    } else {
        // Fallback, falls Pop-ups blockiert sind: Download
        downloadAsTxt(formattedData, "bewerbungsdaten_fuer_discord.txt");
        alert("Die Daten wurden als TXT-Datei heruntergeladen (Pop-up evtl. blockiert). Bitte öffne die Datei und kopiere den Inhalt für Discord.");
    }
    
    // Optional: Formular zurücksetzen
    // const form = document.getElementById('bewerbungsformular');
    // if (form) form.reset();

    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
}

/**
 * Escaped HTML-Zeichen, um XSS bei der Anzeige in neuem Tab zu verhindern.
 * @param {string} unsafeText
 * @returns {string}
 */
function escapeHtml(unsafeText) {
    if (typeof unsafeText !== 'string') return '';
    return unsafeText
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, """)
         .replace(/'/g, "'");
}

/**
 * Löst einen Download einer Textdatei im Browser aus.
 * @param {string} text Der Inhalt der Datei.
 * @param {string} filename Der gewünschte Dateiname.
 */
function downloadAsTxt(text, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


// Event-Listener, die ausgeführt werden, wenn das DOM vollständig geladen ist.
document.addEventListener('DOMContentLoaded', function() {
    // Event-Listener für das Hamburger-Menü (Icon-Klick)
    // Das onclick="toggleMenu()" ist bereits im HTML.

    // Smooth scroll für Anker-Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        let headerOffset = 0;
                        const desktopNav = document.getElementById('desktop-nav');
                        const hamburgerNav = document.getElementById('hamburger-nav');

                        if (desktopNav && getComputedStyle(desktopNav).display !== 'none' && getComputedStyle(desktopNav).position === 'fixed') {
                            headerOffset = desktopNav.offsetHeight;
                        } else if (hamburgerNav && getComputedStyle(hamburgerNav).display !== 'none' && getComputedStyle(hamburgerNav).position === 'fixed') {
                            headerOffset = hamburgerNav.offsetHeight;
                        }
                        
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                } catch (error) {
                    console.error("Error finding element for smooth scroll:", targetId, error);
                }
            } else if (this.href && !this.href.includes('#') && !this.classList.contains('nav-as-button')) {
                window.location.href = this.href;
            }
        });
    });

    // Schließe das Hamburger-Menü, wenn außerhalb geklickt wird
    document.addEventListener('click', function(event) {
        const hamburgerMenuContainer = document.querySelector('#hamburger-nav .hamburger-menu');
        const menuLinks = document.querySelector("#hamburger-nav .menu-links");
        
        if (menuLinks && menuLinks.classList.contains('open')) {
            if (hamburgerMenuContainer && !hamburgerMenuContainer.contains(event.target)) {
                toggleMenu();
            }
        }
    });

    // Body-Padding beim Laden und bei Größenänderung des Fensters anpassen
    window.addEventListener('load', adjustBodyPadding);
    window.addEventListener('resize', adjustBodyPadding);
    adjustBodyPadding();

    // Aktuelles Jahr im Footer setzen
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ARIA-Attribute für Hamburger-Icon initial setzen
    const hamburgerIconAria = document.querySelector("#hamburger-nav .hamburger-icon");
    if (hamburgerIconAria) {
        hamburgerIconAria.setAttribute("aria-expanded", "false");
        hamburgerIconAria.setAttribute("aria-controls", "menu-links-hamburger");
        const menuUl = document.querySelector("#hamburger-nav .menu-links");
        if (menuUl) menuUl.id = "menu-links-hamburger";
    }

    // Event-Listener für den "Daten für Discord vorbereiten" Button
    const prepareButton = document.getElementById('prepareForDiscordBtn');
    if (prepareButton) {
        prepareButton.addEventListener('click', handlePrepareForDiscord);
    } else {
        console.warn("Button mit ID 'prepareForDiscordBtn' nicht gefunden.");
    }
});
