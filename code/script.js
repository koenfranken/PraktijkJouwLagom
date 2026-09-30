/*
 * Bouwt de pagina op uit twee tekstbestanden:
 *   - site.md: instellingen die voor de hele site gelden (naam, logo, kleuren, menu, footer)
 *   - de .md van deze pagina: de rijen en secties, en eventueel instellingen die afwijken
 *
 * Welke bestanden dat zijn, staat in de HTML-pagina:
 *   <script src="code/script.js" data-site="site.md" data-md="index.md" defer></script>
 *
 * Leesvolgorde: begin onderaan bij "Opstarten", daarna de onderdelen van boven naar beneden.
 */

document.documentElement.classList.add('js');
const scriptTag = document.currentScript;


/* ─── 1. Een .md-bestand lezen ────────────────────────────────────────────── */

// De markeringen die een nieuw blok beginnen, bijvoorbeeld [sectie achtergrond=olijf].
// Een markering staat altijd alleen op een regel.
const MARKERING = /^\[(site|kleuren|menu|footer|rij|sectie|kaart|tijdlijn)\b\s*(.*)\]$/;

// Knipt de tekst op in blokken: bij elke markering begint een nieuw blok.
// Tekst vóór de eerste markering hoort bij geen enkel blok en wordt dus niet getoond.
function splitsInBlokken(tekst) {
    const blokken = [];
    for (const regel of tekst.split(/\r?\n/)) {
        const markering = regel.trim().match(MARKERING);
        if (markering) {
            blokken.push({ naam: markering[1], rest: markering[2].trim(), regels: [] });
        } else {
            blokken.at(-1)?.regels.push(regel);
        }
    }
    return blokken;
}

// Zet de blokken om in een overzicht van wat er in het bestand staat.
// `basis` is de locatie van het bestand; paden in het bestand gelden vanaf daar.
function leesBestand(tekst, basis) {
    const bestand = { site: {}, kleuren: {}, menu: null, footer: null, rijen: [] };

    for (const blok of splitsInBlokken(tekst)) {
        const rij = bestand.rijen.at(-1);
        const sectie = rij?.secties.at(-1);

        switch (blok.naam) {
            case 'site':
            case 'kleuren':
                Object.assign(bestand[blok.naam], leesInstellingen(blok.regels));
                break;
            case 'menu':
            case 'footer':
                bestand[blok.naam] = { regels: blok.regels, basis };
                break;
            case 'rij':
                bestand.rijen.push({ opties: leesOpties(blok.rest), secties: [] });
                break;
            case 'sectie':
                if (!rij) {
                    console.warn('[sectie] zonder [rij] ervoor wordt overgeslagen');
                    break;
                }
                rij.secties.push({
                    opties: leesOpties(blok.rest),
                    basis,
                    delen: [{ soort: 'tekst', regels: blok.regels }],
                });
                break;
            case 'kaart':
            case 'tijdlijn':
                if (!sectie) {
                    console.warn(`[${blok.naam}] buiten een [sectie] wordt overgeslagen`);
                    break;
                }
                sectie.delen.push({ soort: blok.naam, titel: blok.rest, regels: blok.regels });
                break;
        }
    }

    // Het logo is een pad; dat moet gelden vanaf het bestand waarin het staat.
    if (bestand.site.logo) bestand.site.logo = pad(bestand.site.logo, basis);
    return bestand;
}

// Regels als "naam: Jouw Lagom" → { naam: 'Jouw Lagom' }. Lege regels worden overgeslagen.
function leesInstellingen(regels) {
    const instellingen = {};
    for (const regel of regels) {
        const dubbelepunt = regel.indexOf(':');
        if (dubbelepunt === -1) continue;
        const sleutel = regel.slice(0, dubbelepunt).trim();
        instellingen[sleutel] = regel.slice(dubbelepunt + 1).trim();
    }
    return instellingen;
}

// "achtergrond=olijf schaal=2" → { achtergrond: 'olijf', schaal: '2' }
function leesOpties(tekst) {
    const opties = {};
    for (const deel of tekst.split(/\s+/)) {
        const [sleutel, waarde] = deel.split('=');
        if (sleutel && waarde) opties[sleutel] = waarde;
    }
    return opties;
}


/* ─── 2. Markdown omzetten naar HTML ──────────────────────────────────────── */

// Zet een reeks regels om naar HTML. Regels die bij elkaar horen (een alinea, een lijst,
// een rij knoppen) worden eerst verzameld in een "open blok" en samen omgezet.
// Een lege regel sluit het open blok af.
function markdownNaarHtml(regels, basis) {
    const html = [];
    let open = null;

    const sluitBlok = () => {
        if (open) html.push(blokNaarHtml(open, basis));
        open = null;
    };
    const voegToeAanBlok = (soort, tekst) => {
        if (open?.soort !== soort) {
            sluitBlok();
            open = { soort, regels: [] };
        }
        open.regels.push(tekst);
    };

    for (const regel of regels.map(r => r.trim())) {
        const kop = regel.match(/^(#{1,4})\s+(.+)$/);            // # Kop
        const label = regel.match(/^\[label\s+(.+)\]$/);         // [label Diensten]
        const punt = regel.match(/^[-*]\s+(.+)$/);               // - opsommingsteken
        const nummer = regel.match(/^\d+[.)]\s+(.+)$/);          // 1. genummerd
        const citaat = regel.match(/^>\s?(.*)$/);                // > citaat
        const knop = /^\[[^\]]+\]\([^)]+\)$/.test(regel);        // alleen een link op de regel

        if (regel === '') {
            sluitBlok();
        } else if (kop) {
            sluitBlok();
            const niveau = kop[1].length;
            html.push(`<h${niveau}>${opmaak(kop[2], basis)}</h${niveau}>`);
        } else if (label) {
            sluitBlok();
            html.push(`<p class="label">${opmaak(label[1], basis)}</p>`);
        } else if (punt) {
            voegToeAanBlok('ul', punt[1]);
        } else if (nummer) {
            voegToeAanBlok('ol', nummer[1]);
        } else if (citaat) {
            voegToeAanBlok('blockquote', citaat[1]);
        } else if (knop) {
            voegToeAanBlok('knoppen', regel);
        } else {
            voegToeAanBlok('p', regel);
        }
    }
    sluitBlok();
    return html.join('\n');
}

function blokNaarHtml({ soort, regels }, basis) {
    const lijstItems = () => regels.map(r => `<li>${opmaak(r, basis)}</li>`).join('');
    const doorlopend = opmaak(regels.join(' '), basis);

    switch (soort) {
        case 'ul': return `<ul>${lijstItems()}</ul>`;
        case 'ol': return `<ol>${lijstItems()}</ol>`;
        case 'blockquote': return `<blockquote><p>${doorlopend}</p></blockquote>`;
        case 'knoppen': return `<p class="knoppen">${regels.map(r => opmaak(r, basis)).join('')}</p>`;
        default: return `<p>${doorlopend}</p>`;
    }
}

// Opmaak binnen een regel: afbeeldingen, links, **vet**, *cursief* en ==accent==.
function opmaak(tekst, basis) {
    return ontsnap(tekst)
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, adres) => `<img src="${pad(adres, basis)}" alt="${alt}">`)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, tekst, adres) => `<a href="${pad(adres, basis)}">${tekst}</a>`)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/==(.+?)==/g, '<mark>$1</mark>');
}

// Tekens die in HTML een betekenis hebben, worden gewone tekst.
function ontsnap(tekst) {
    return tekst.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// Maakt van een pad in een .md-bestand een volledig adres, gerekend vanaf dat bestand.
// Een link naar een plek op dezelfde pagina (#contact) blijft zoals hij is.
function pad(adres, basis) {
    return adres.startsWith('#') ? adres : new URL(adres, basis).href;
}


/* ─── 3. De pagina bouwen ─────────────────────────────────────────────────── */

function zetTitelEnBeschrijving(site) {
    document.title = site.titel ?? site.naam ?? '';
    if (site.beschrijving) {
        document.head.append(Object.assign(document.createElement('meta'), { name: 'description', content: site.beschrijving }));
    }
    if (site.logo) {
        document.head.append(Object.assign(document.createElement('link'), { rel: 'icon', href: site.logo }));
    }
}

// Elke kleur uit [kleuren] wordt een CSS-variabele: "olijf: #6F7D45" → --kleur-olijf.
function zetKleuren(kleuren) {
    const root = document.documentElement.style;
    for (const [naam, waarde] of Object.entries(kleuren)) {
        root.setProperty(`--kleur-${naam}`, waarde);
    }
    // Tekst op een knop in de accentkleur: licht of donker, afhankelijk van het accent.
    root.setProperty('--op-accent', isDonker(kleuren.accent) ? 'var(--kleur-achtergrond)' : 'var(--kleur-tekst)');
}

// Is een kleur (#rrggbb) donker? Dan hoort er lichte tekst op.
// De formule weegt rood, groen en blauw zoals het oog ze ervaart (resultaat 0–255).
function isDonker(kleur) {
    const hex = /^#([0-9a-f]{6})$/i.exec(kleur ?? '');
    if (!hex) return false;
    const [rood, groen, blauw] = [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16));
    return 0.299 * rood + 0.587 * groen + 0.114 * blauw < 150;
}

// "olijf" → "var(--kleur-olijf)", met een waarschuwing als de kleur niet in [kleuren] staat.
function kleur(naam, kleuren) {
    if (!(naam in kleuren)) console.warn(`Kleur "${naam}" staat niet in [kleuren]`);
    return `var(--kleur-${naam})`;
}

// Laadt een font van Google Fonts. Geeft een belofte terug die klaar is als het stylesheet binnen is.
function laadFont(naam, cssVariabele, gewichten) {
    if (!naam) return Promise.resolve();
    document.documentElement.style.setProperty(cssVariabele, `'${naam}'`);
    const link = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css2?family=${naam.replaceAll(' ', '+')}${gewichten}&display=swap`,
    });
    document.head.append(link);
    return new Promise(klaar => { link.onload = link.onerror = klaar; });
}

function maakMenubalk(site, menu, siteBasis) {
    const balk = document.createElement('header');
    balk.className = 'menubalk';
    balk.innerHTML = `
        <div class="breedte">
            <a class="merk" href="${pad('./', siteBasis)}">
                ${site.logo ? `<img src="${site.logo}" alt="">` : ''}
                ${site.naam ? `<span>${ontsnap(site.naam)}</span>` : ''}
            </a>
            <button class="menuknop" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
            <nav>${menu ? markdownNaarHtml(menu.regels, menu.basis) : ''}</nav>
        </div>`;
    return balk;
}

function maakRij(rij, kleuren) {
    const element = document.createElement('div');
    element.className = rij.secties.length === 2 ? 'rij twee' : 'rij';
    if (rij.secties.length > 2) console.warn('Een [rij] heeft maximaal twee secties');

    // verhouding=1:2 → de linker sectie krijgt 1/3 van de breedte
    if (rij.opties.verhouding) {
        const [links, rechts] = rij.opties.verhouding.split(':').map(Number);
        element.style.setProperty('--deel', links / (links + rechts));
    }

    element.append(...rij.secties.map(sectie => maakSectie(sectie, kleuren)));
    return element;
}

function maakSectie(sectie, kleuren) {
    const { achtergrond, tekst, patroon, patroonkleur, schaal, uitlijning, id } = sectie.opties;
    const element = document.createElement('section');
    element.className = 'sectie';
    if (id) element.id = id;

    if (achtergrond) {
        element.style.setProperty('--vlak', kleur(achtergrond, kleuren));
        if (isDonker(kleuren[achtergrond])) element.classList.add('donker');
    }
    if (tekst) {
        element.style.setProperty('--tekst', kleur(tekst, kleuren));
        element.style.setProperty('--koppen', kleur(tekst, kleuren));
    }
    if (patroon) {
        element.classList.add('patroon');
        element.style.setProperty('--patroon', `url("${pad(patroon, sectie.basis)}")`);
    }
    if (patroonkleur) element.style.setProperty('--patroonkleur', kleur(patroonkleur, kleuren));
    if (schaal) element.style.setProperty('--schaal', schaal);
    if (uitlijning) {
        const verticaal = { boven: 'start', midden: 'center', onder: 'end' }[uitlijning];
        if (verticaal) element.style.setProperty('--uitlijning', verticaal);
        else console.warn(`uitlijning=${uitlijning} bestaat niet; kies boven, midden of onder`);
    }

    element.innerHTML = `<div class="inhoud reveal">${delenNaarHtml(sectie.delen, sectie.basis)}</div>`;
    return element;
}

// Een sectie bestaat uit tekst, gevolgd door eventueel kaarten of tijdlijn-items.
// Opeenvolgende kaarten komen samen in één raster, opeenvolgende tijdlijn-items in één tijdlijn.
function delenNaarHtml(delen, basis) {
    const groepen = [];
    for (const deel of delen) {
        const vorige = groepen.at(-1);
        if (vorige?.soort === deel.soort) vorige.delen.push(deel);
        else groepen.push({ soort: deel.soort, delen: [deel] });
    }

    return groepen.map(({ soort, delen }) => {
        const inhoud = deel => markdownNaarHtml(deel.regels, basis);
        switch (soort) {
            case 'kaart':
                return `<div class="kaarten">${delen.map(d => `<div class="kaart reveal">${inhoud(d)}</div>`).join('')}</div>`;
            case 'tijdlijn':
                return `<ol class="tijdlijn">${delen.map(d =>
                    `<li class="reveal"><p class="periode">${opmaak(d.titel, basis)}</p>${inhoud(d)}</li>`).join('')}</ol>`;
            default:
                return delen.map(inhoud).join('');
        }
    }).join('');
}

// De footer is opgemaakt als een sectie in de kleur van de koppen.
function maakFooter(footer, kleuren) {
    const element = document.createElement('footer');
    element.className = 'footer';
    element.style.setProperty('--vlak', 'var(--kleur-koppen)');
    if (isDonker(kleuren.koppen ?? kleuren.tekst)) element.classList.add('donker');
    element.innerHTML = `<div class="breedte">${footer ? markdownNaarHtml(footer.regels, footer.basis) : ''}</div>`;
    return element;
}

// Geeft secties en koppen een anker, zodat je ernaar kunt linken (#diensten).
// Een sectie krijgt het anker van haar [label], tenzij er id= bij staat.
// Bestaat een anker al, dan houdt het eerste element het.
function maakAnkers() {
    const geefAnker = (element, tekst) => {
        const anker = maakAnker(tekst);
        if (!element.id && anker && !document.getElementById(anker)) element.id = anker;
    };
    document.querySelectorAll('.sectie').forEach(sectie => {
        const label = sectie.querySelector('.label');
        if (label) geefAnker(sectie, label.textContent);
    });
    document.querySelectorAll('main :is(h1, h2, h3, h4)').forEach(kop => geefAnker(kop, kop.textContent));
}

// "1. Beëindiging van de Overeenkomst" → "1-beeindiging-van-de-overeenkomst"
function maakAnker(tekst) {
    return tekst.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')   // ë → e
        .replace(/[^a-z0-9]+/g, '-')                        // al het andere wordt een streepje
        .replace(/^-|-$/g, '');
}


/* ─── 4. Gedrag ───────────────────────────────────────────────────────────── */

function activeerMenu() {
    const balk = document.querySelector('.menubalk');
    const knop = balk.querySelector('.menuknop');
    const zetOpen = open => {
        balk.classList.toggle('open', open);
        knop.setAttribute('aria-expanded', open);
    };
    const bijScrollen = () => balk.classList.toggle('gescrold', scrollY > 20);

    addEventListener('scroll', bijScrollen, { passive: true });
    bijScrollen();
    knop.addEventListener('click', () => zetOpen(!balk.classList.contains('open')));
    balk.addEventListener('click', e => e.target.closest('nav a') && zetOpen(false));
    document.addEventListener('click', e => !balk.contains(e.target) && zetOpen(false));
}

// Bij twee secties naast elkaar blijft de kortste staan tijdens het scrollen (zie .plakt in de CSS).
// Alleen als hij op het scherm past; anders zou de onderkant nooit in beeld komen.
function controleerPlakken() {
    const menuHoogte = document.querySelector('.menubalk').offsetHeight;
    document.querySelectorAll('.twee .inhoud').forEach(inhoud => {
        const past = inhoud.offsetHeight < innerHeight - menuHoogte - 64;
        inhoud.classList.toggle('plakt', past);
    });
}

// Links naar een andere website openen in een nieuw tabblad.
function openExterneLinksApart() {
    document.querySelectorAll('a[href^="http"]').forEach(a => {
        if (a.host !== location.host) Object.assign(a, { target: '_blank', rel: 'noopener' });
    });
}

// Blokken met .reveal vagen in zodra ze in beeld komen.
function activeerInvagen() {
    const blokken = document.querySelectorAll('.reveal');
    const waarnemer = new IntersectionObserver(items => items.forEach(item => {
        if (!item.isIntersecting) return;
        item.target.classList.add('visible');
        waarnemer.unobserve(item.target);
    }), { threshold: 0.1 });
    blokken.forEach(blok => waarnemer.observe(blok));
}


/* ─── 5. Opstarten ────────────────────────────────────────────────────────── */

async function laadTekst(adres) {
    const antwoord = await fetch(adres);
    if (!antwoord.ok) throw new Error(`${antwoord.status} bij laden van ${adres}`);
    return antwoord.text();
}

(async () => {
    let fontsGeladen = Promise.resolve();
    try {
        const siteAdres = new URL(scriptTag.dataset.site, location.href);
        const paginaAdres = new URL(scriptTag.dataset.md, location.href);
        const [siteTekst, paginaTekst] = await Promise.all([laadTekst(siteAdres), laadTekst(paginaAdres)]);
        const site = leesBestand(siteTekst, siteAdres);
        const pagina = leesBestand(paginaTekst, paginaAdres);

        // Wat de pagina zelf instelt, gaat voor op site.md. [menu] en [footer] gaan in hun geheel.
        const instellingen = { ...site.site, ...pagina.site };
        const kleuren = { ...site.kleuren, ...pagina.kleuren };
        const menu = pagina.menu ?? site.menu;
        const footer = pagina.footer ?? site.footer;

        zetTitelEnBeschrijving(instellingen);
        zetKleuren(kleuren);
        fontsGeladen = Promise.all([
            laadFont(instellingen['font-koppen'], '--font-koppen', ''),
            laadFont(instellingen['font-tekst'], '--font-tekst', ':wght@400;600'),
        ]);

        const main = document.createElement('main');
        main.append(...pagina.rijen.map(rij => maakRij(rij, kleuren)));
        document.body.append(maakMenubalk(instellingen, menu, siteAdres), main, maakFooter(footer, kleuren));

        maakAnkers();
        openExterneLinksApart();
        activeerMenu();
    } catch (fout) {
        console.error('De pagina kon niet volledig geladen worden:', fout);
    } finally {
        // Wacht op de fonts (maximaal --font-wait ms), zodat de tekst niet verspringt.
        // Eerst de opmaak forceren: pas dan vraagt de browser de fonts van de nieuwe tekst aan.
        const fontWacht = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-wait')) || 1000;
        const fontsKlaar = fontsGeladen.then(() => {
            void document.body.offsetHeight;
            return document.fonts.ready;
        });
        await Promise.race([fontsKlaar, new Promise(klaar => setTimeout(klaar, fontWacht))]);

        if (document.querySelector('.menubalk')) {
            controleerPlakken();
            addEventListener('resize', controleerPlakken);
            addEventListener('load', controleerPlakken);   // afbeeldingen kunnen de hoogte nog veranderen
        }
        activeerInvagen();
        document.documentElement.classList.add('ready');
        // De ankers bestaan pas nu, dus zelf naar een #anker in de adresbalk springen.
        if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }
})();
