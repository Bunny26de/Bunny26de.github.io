// Funktion zum Umschalten des Hamburger-Menüs
function toggleMenu() {
    const menu = document.querySelector("#hamburger-nav .menu-links");
    const icon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (menu && icon) {
        menu.classList.toggle("open");
        icon.classList.toggle("open");
        const isExpanded = menu.classList.contains("open");
        icon.setAttribute("aria-expanded", isExpanded.toString());
    }
}

document.addEventListener('DOMContentLoaded', function() {
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
            } else if (this.href && !this.href.includes('#')) {
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

    // Dynamisches Body-Padding für fixierte Navigation
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
    window.addEventListener('load', adjustBodyPadding);
    window.addEventListener('resize', adjustBodyPadding);
    adjustBodyPadding();

    // Aktuelles Jahr im Footer setzen
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ARIA-Attribute für Hamburger-Icon initial setzen
    const hamburgerIcon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (hamburgerIcon) {
        hamburgerIcon.setAttribute("aria-expanded", "false");
        hamburgerIcon.setAttribute("aria-controls", "menu-links-hamburger");
        const menuUl = document.querySelector("#hamburger-nav .menu-links");
        if (menuUl) menuUl.id = "menu-links-hamburger";
    }

    // --- Discord Webhook Integration ---
    const submitToDiscordButton = document.getElementById('submitToDiscordBtn');
    if (submitToDiscordButton) {
        submitToDiscordButton.addEventListener('click', handleSubmitToDiscord);
    }
});


function collectFormDataForDiscord() {
    const form = document.getElementById('bewerbungsformular');
    if (!form) return null;

    const formData = new FormData(form);
    let messageContent = "**Neue Bewerbung für das Zuhör-Projekt**\n";
    messageContent += "=====================================\n\n";

    // --- Teil 1: Allgemeine Angaben ---
    messageContent += "**Teil 1: Allgemeine Angaben**\n";
    messageContent += `> **Vor- und Nachname:** ${formData.get('name') || 'N/A'}\n`;
    messageContent += `> **E-Mail-Adresse:** ${formData.get('email') || 'N/A'}\n`;
    messageContent += `> **Alter:** ${formData.get('alter') || 'N/A'}\n`;
    messageContent += `> **Beruf / Ausbildung:** ${formData.get('beruf') || 'N/A'}\n`;
    messageContent += `> **Bisherige Erfahrungen:**\n> ${(formData.get('erfahrungen_beratung') || 'N/A').replace(/\n/g, '\n> ')}\n\n`;

    // --- Teil 2: Selbsteinschätzung ---
    messageContent += "**Teil 2: Selbsteinschätzung**\n";
    const assessmentTable = document.querySelector('.assessment-table tbody');
    if (assessmentTable) {
        for (let i = 0; i < assessmentTable.rows.length; i++) {
            const row = assessmentTable.rows[i];
            const questionText = row.cells[0] ? row.cells[0].textContent.trim() : `Frage ${i + 1}`;
            const radioName = `selbst${i + 1}`;
            const value = formData.get(radioName);
            messageContent += `> **${questionText}:** ${value || 'Nicht beantwortet'}\n`;
        }
    }
    messageContent += "\n";
    
    // --- Teil 3: Reflexionsfragen ---
    messageContent += "**Teil 3: Reflexionsfragen**\n";
    const reflexionTextareas = [
        { id: 'reflexion_motivation', label: 'Was motiviert dich, an diesem Projekt teilzunehmen?' },
        { id: 'reflexion_umgang', label: 'Was ist dir besonders wichtig im Umgang mit anderen Menschen?' },
        { id: 'reflexion_wut', label: 'Wie reagierst du, wenn du das Gefühl hast, jemand projiziert seine Wut auf dich?' },
        { id: 'reflexion_beistand', label: 'Beschreibe eine Situation, in der du jemandem erfolgreich beigestanden hast.' },
        { id: 'reflexion_selbsthilfe', label: 'Wie erkennst du, dass du selbst Unterstützung brauchst – und was tust du dann?' },
        { id: 'reflexion_haltung', label: 'Welche Haltung möchtest du in Gesprächen vertreten (z.B. Neutralität, Mitgefühl, Lösungsorientierung)?' },
        { id: 'reflexion_schwere_zeit', label: 'Was würdest du tun, wenn du selbst gerade eine schwere Zeit hast – kannst du dann trotzdem Gespräche führen?' }
    ];
    reflexionTextareas.forEach(item => {
        messageContent += `> **${item.label}**\n> ${(formData.get(item.id) || 'N/A').replace(/\n/g, '\n> ')}\n\n`;
    });

    // --- Teil 4: Einschätzungsfragen ---
    messageContent += "**Teil 4: Einschätzungsfragen**\n";
    const themaZuNahValue = formData.get('thema_zu_nah');
    let themaZuNahText = 'N/A';
    if (themaZuNahValue === 'd_text') {
        themaZuNahText = `Sonstiges: ${formData.get('thema_zu_nah_sonstiges_text') || 'N/A'}`;
    } else if (themaZuNahValue) {
        const radioLabel = document.querySelector(`input[name="thema_zu_nah"][value="${themaZuNahValue}"]`);
        themaZuNahText = radioLabel && radioLabel.parentElement ? radioLabel.parentElement.textContent.trim() : themaZuNahValue;
    }
    messageContent += `> **Was tust du, wenn dir während eines Gesprächs ein Thema zu nah geht?** ${themaZuNahText}\n`;
    messageContent += `> **Wie würdest du reagieren, wenn jemand im Gespräch Suizidgedanken äußert?**\n> ${(formData.get('einschatzung_suizid') || 'N/A').replace(/\n/g, '\n> ')}\n`;
    
    const unsichereThemen = [];
    document.querySelectorAll('input[name="unsichere_themen[]"]:checked').forEach(checkbox => {
        unsichereThemen.push(checkbox.parentElement.textContent.trim());
    });
    messageContent += `> **In welchen Themen fühlst du dich eher unsicher?** ${unsichereThemen.length > 0 ? unsichereThemen.join(', ') : 'Keine angegeben oder alle sicher'}\n`;

    const weiterbildungValue = formData.get('weiterbildung');
    let weiterbildungText = 'N/A';
    if (weiterbildungValue === 'bestimmte') {
        weiterbildungText = `Nur in bestimmten Themen: ${formData.get('weiterbildung_themen_spezifisch_text') || 'N/A'}`;
    } else if (weiterbildungValue) {
        const radioLabel = document.querySelector(`input[name="weiterbildung"][value="${weiterbildungValue}"]`);
        // Entferne den Erklärungstext aus dem Label
        let labelContent = radioLabel && radioLabel.parentElement ? radioLabel.parentElement.textContent.trim() : weiterbildungValue;
        const explanationIndex = labelContent.indexOf('(');
        if (explanationIndex > -1) {
            labelContent = labelContent.substring(0, explanationIndex).trim();
        }
        weiterbildungText = labelContent;
    }
    messageContent += `> **Wärst du bereit, dich in diesen Bereichen weiterzubilden?** ${weiterbildungText}\n\n`;

    // --- Teil 5: Verfügbarkeit & Rahmenbedingungen ---
    messageContent += "**Teil 5: Verfügbarkeit & Rahmenbedingungen**\n";
    const zeitProWoche = formData.get('zeit_pro_woche');
    messageContent += `> **Wie viel Zeit könntest du pro Woche aufbringen?** ${zeitProWoche ? document.querySelector(`input[name="zeit_pro_woche"][value="${zeitProWoche}"]`).parentElement.textContent.trim() : 'N/A'}\n`;

    const verfuegbarkeitWann = [];
    document.querySelectorAll('input[name="verfuegbarkeit_wann[]"]:checked').forEach(checkbox => {
        verfuegbarkeitWann.push(checkbox.parentElement.textContent.trim());
    });
    messageContent += `> **Wann bist du vorrangig verfügbar?** ${verfuegbarkeitWann.length > 0 ? verfuegbarkeitWann.join(', ') : 'N/A'}\n`;
    
    const schulungTeilnahme = formData.get('schulung_teilnahme');
    messageContent += `> **Bist du bereit, an einer vorbereitenden Schulung teilzunehmen?** ${schulungTeilnahme ? document.querySelector(`input[name="schulung_teilnahme"][value="${schulungTeilnahme}"]`).parentElement.textContent.trim() : 'N/A'}\n\n`;

    // --- Weitere Reflexionsfragen ---
    messageContent += "**Weitere Reflexionsfragen**\n";
    const weitereFragenTextareas = [
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
    weitereFragenTextareas.forEach(item => {
        messageContent += `> **${item.label}**\n> ${(formData.get(item.id) || 'N/A').replace(/\n/g, '\n> ')}\n\n`;
    });

    // --- Abschlussfrage ---
    const abschlussMitgeben = formData.get('abschluss_mitgeben');
    if (abschlussMitgeben && abschlussMitgeben.trim() !== '') {
        messageContent += "**Abschlussfrage (optional):**\n";
        messageContent += `> ${abschlussMitgeben.replace(/\n/g, '\n> ')}\n\n`;
    }
    
    // Discord hat ein Zeichenlimit pro Nachricht (2000).
    // Bei Bedarf auf mehrere Nachrichten aufteilen oder kürzen.
    // Hier wird einfach ein Array von Nachrichten zurückgegeben.
    const messages = [];
    const maxChars = 1900; // Etwas Puffer lassen
    let currentMessage = "";

    const lines = messageContent.split('\n');
    for (const line of lines) {
        if ((currentMessage + line + '\n').length > maxChars) {
            messages.push(currentMessage);
            currentMessage = line + '\n';
        } else {
            currentMessage += line + '\n';
        }
    }
    if (currentMessage.trim() !== "") {
        messages.push(currentMessage);
    }
    
    return messages; // Gibt ein Array von Nachrichten zurück
}

async function handleSubmitToDiscord() {
    const messages = collectFormDataForDiscord();
    if (!messages || messages.length === 0) {
        alert("Fehler: Keine Daten zum Senden gefunden.");
        return;
    }

    // ** ACHTUNG: Webhook URL direkt im Client-Code ist ein Sicherheitsrisiko! **
    const discordWebhookUrl = "https://discord.com/api/webhooks/1379774144060592168/zr-YHEi9-LuGxSLMe2S4dg4-JcSbFSeFd6BWD3HmJN8qe3G12cK2Wo-TSJ_4Pni1GMsm";

    const submitButton = document.getElementById('submitToDiscordBtn');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sende...';
    submitButton.disabled = true;

    let allSentSuccessfully = true;

    for (const messagePart of messages) {
        if (messagePart.trim() === "") continue; // Leere Teile überspringen

        try {
            const response = await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: messagePart }),
            });

            if (!response.ok) {
                allSentSuccessfully = false;
                const errorData = await response.text();
                console.error(`Fehler beim Senden eines Teils an Discord: ${response.status} - ${errorData}`);
                // Nicht direkt alerten, um den Nutzer nicht mit mehreren Alerts zu bombardieren
                break; // Abbruch bei erstem Fehler
            }
            // Kurze Pause zwischen den Nachrichten, um Rate Limits zu vermeiden (optional)
            await new Promise(resolve => setTimeout(resolve, 300)); 
        } catch (error) {
            allSentSuccessfully = false;
            console.error('Netzwerkfehler beim Senden an Discord:', error);
            break; // Abbruch bei Netzwerkfehler
        }
    }

    if (allSentSuccessfully) {
        alert('Bewerbung erfolgreich an Discord gesendet!');
        document.getElementById('bewerbungsformular').reset(); // Formular zurücksetzen
    } else {
        alert('Ein Fehler ist beim Senden der Bewerbung an Discord aufgetreten. Bitte überprüfe die Konsole für Details oder versuche es später erneut.');
    }

    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
}
