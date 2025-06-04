// Funktion zum Umschalten des Hamburger-Menüs
function toggleMenu() {
    const menu = document.querySelector("#hamburger-nav .menu-links");
    const icon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (menu && icon) { // Sicherstellen, dass Elemente existieren
        menu.classList.toggle("open");
        icon.classList.toggle("open");
        // ARIA-Attribute für Barrierefreiheit setzen
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
            // Nur fortfahren, wenn targetId auch wirklich eine ID ist (beginnt mit # und hat mehr als nur #)
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

                        // Hamburger-Menü schließen, wenn ein Link darin geklickt wurde und das Menü offen ist
                        // Die onclick="toggleMenu()" im HTML kümmert sich darum.
                        // Falls man es hier machen wollte:
                        const menuHamburger = document.querySelector("#hamburger-nav .menu-links");
                        if (menuHamburger && menuHamburger.classList.contains("open") && this.closest('#hamburger-nav')) {
                           // toggleMenu(); // Ist schon im HTML onclick
                        }
                    }
                } catch (error) {
                    console.error("Error finding element for smooth scroll:", targetId, error);
                }
            } else if (this.href && !this.href.includes('#')) {
                // Wenn es ein normaler Link ohne Hash ist, Standardverhalten zulassen
                window.location.href = this.href;
            }
        });
    });

    // Schließe das Hamburger-Menü, wenn außerhalb geklickt wird
    document.addEventListener('click', function(event) {
        const hamburgerMenuContainer = document.querySelector('#hamburger-nav .hamburger-menu');
        const menuLinks = document.querySelector("#hamburger-nav .menu-links");
        
        if (menuLinks && menuLinks.classList.contains('open')) {
            // Prüfen, ob der Klick außerhalb des .hamburger-menu Containers war
            if (hamburgerMenuContainer && !hamburgerMenuContainer.contains(event.target)) {
                toggleMenu(); // Nutzt die zentrale toggleMenu Funktion
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

    // Beim Laden und bei Größenänderung des Fensters anpassen
    window.addEventListener('load', adjustBodyPadding);
    window.addEventListener('resize', adjustBodyPadding);
    adjustBodyPadding(); // Einmal initial aufrufen für den Fall, dass JS vor CSS-Rendering läuft

    // Aktuelles Jahr im Footer setzen
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ARIA-Attribute für Hamburger-Icon initial setzen
    const hamburgerIcon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (hamburgerIcon) {
        hamburgerIcon.setAttribute("aria-expanded", "false");
        hamburgerIcon.setAttribute("aria-controls", "menu-links-hamburger"); // ID für das Menü wäre gut
        const menuUl = document.querySelector("#hamburger-nav .menu-links");
        if (menuUl) menuUl.id = "menu-links-hamburger";
    }
});