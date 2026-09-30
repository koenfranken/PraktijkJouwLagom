/*
 * Bouwt de pagina op uit twee tekstbestanden:
 *   - site.md: instellingen die voor de hele site gelden (naam, logo, kleuren, thema's, menu, footer)
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

// De markeringen die een nieuw blok beginnen, bijvoorbeeld [sectie thema=groen].
// Een markering staat altijd alleen op een regel.
const MARKERING = /^\[(site|kleuren|thema|menu|footer|rij|sectie|kaart|tijdlijn)\b\s*(.*)\]$/;

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
// Na [footer] horen alle rijen bij de footer; [footer] staat dus altijd als laatste.
function leesBestand(tekst, basis) {
    const bestand = { site: {}, kleuren: {}, themas: {}, menu: null, footer: null, rijen: [] };

    for (const blok of splitsInBlokken(tekst)) {
        const rijen = (bestand.footer ?? bestand).rijen;
        const rij = rijen.at(-1);
        const sectie = rij?.secties.at(-1);

        switch (blok.naam) {
            case 'site':
            case 'kleuren':
                Object.assign(bestand[blok.naam], leesInstellingen(blok.regels));
                break;
            case 'thema':
                if (!blok.rest) throw new Error('[thema] zonder naam; schrijf bijvoorbeeld [thema groen]');
                bestand.themas[blok.rest] = leesInstellingen(blok.regels);
                break;
            case 'menu':
                bestand.menu = { regels: blok.regels, basis };
                break;
            case 'footer':
                if (blok.rest || blok.regels.some(regel => regel.trim())) {
                    throw new Error('Na [footer] komen een [rij] en [sectie], net als op een pagina');
                }
                bestand.footer = { rijen: [] };
                break;
            case 'rij':
                rijen.push({ opties: leesOpties(blok.rest), secties: [] });
                break;
            case 'sectie':
                if (!rij) {
                    throw new Error('[sectie] zonder [rij] ervoor');
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
                    throw new Error(`[${blok.naam}] buiten een [sectie]`);
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
        const knop = regel.match(/^(\[[^\]]+\]\([^)]+\))\{\.knop\}$/); // [tekst](adres){.knop}

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
            voegToeAanBlok('knoppen', knop[1]);
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
    for (const naam of ['titel', 'thema', 'font-koppen', 'font-tekst']) {
        if (!site[naam]) throw new Error(`"${naam}:" ontbreekt in [site]`);
    }
    document.title = site.titel;
    if (site.beschrijving) {
        document.head.append(Object.assign(document.createElement('meta'), { name: 'description', content: site.beschrijving }));
    }
    if (site.logo) {
        document.head.append(Object.assign(document.createElement('link'), { rel: 'icon', href: site.logo }));
    }
}

// Elke kleur uit [kleuren] wordt een CSS-variabele: "groen: #6F7D45" → --kleur-groen.
// Elke kleur moet als #rrggbb geschreven zijn.
function zetKleuren(kleuren) {
    for (const [naam, waarde] of Object.entries(kleuren)) {
        if (!/^#[0-9a-f]{6}$/i.test(waarde)) throw new Error(`Kleur "${naam}: ${waarde}" is geen #rrggbb`);
        document.documentElement.style.setProperty(`--kleur-${naam}`, waarde);
    }
}

// "groen" → "var(--kleur-groen)"; de kleur moet in [kleuren] staan.
function kleur(naam, kleuren) {
    if (!(naam in kleuren)) throw new Error(`Kleur "${naam}" staat niet in [kleuren]`);
    return `var(--kleur-${naam})`;
}

// De rollen die een [thema] invult. Elke rol wordt een CSS-variabele: achtergrond → --achtergrond.
const ROLLEN = ['achtergrond', 'tekst', 'koppen', 'accent', 'knoptekst'];

// Zet de kleuren van een thema op een element (pagina, sectie of footer), en daarna de losse
// opties die ervan afwijken, zoals accent=rood of patroonkleur=licht.
// Wat een element niet zelf zet, erft het van de pagina (het thema uit [site]).
function zetKleurrollen(element, opties, stijl) {
    if (opties.thema) {
        const thema = stijl.themas[opties.thema];
        if (!thema) throw new Error(`Thema "${opties.thema}" bestaat niet; maak een [thema ${opties.thema}] in site.md`);
        for (const rol of ROLLEN) {
            if (!thema[rol]) throw new Error(`"${rol}:" ontbreekt in [thema ${opties.thema}]`);
            element.style.setProperty(`--${rol}`, kleur(thema[rol], stijl.kleuren));
        }
    }
    for (const rol of [...ROLLEN, 'patroonkleur']) {
        if (opties[rol]) element.style.setProperty(`--${rol}`, kleur(opties[rol], stijl.kleuren));
    }
}

// Laadt een font van Google Fonts. Geeft een belofte terug die klaar is als het stylesheet binnen is.
// Een onbekende fontnaam (of geen verbinding met Google) geeft een foutmelding op de pagina.
function laadFont(naam, cssVariabele, gewichten) {
    document.documentElement.style.setProperty(cssVariabele, `'${naam}'`);
    const link = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css2?family=${naam.replaceAll(' ', '+')}${gewichten}&display=swap`,
    });
    document.head.append(link);
    return new Promise(klaar => {
        link.onload = klaar;
        link.onerror = () => { toonFout(`Font "${naam}" kon niet geladen worden van Google Fonts`); klaar(); };
    });
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

function maakRij(rij, stijl) {
    const element = document.createElement('div');
    element.className = rij.secties.length === 2 ? 'rij twee' : 'rij';
    if (rij.secties.length > 2) throw new Error('Een [rij] heeft maximaal twee secties');

    // verhouding=1:2 → de linker sectie krijgt 1/3 van de breedte
    if (rij.opties.verhouding) {
        const [links, rechts] = rij.opties.verhouding.split(':').map(Number);
        element.style.setProperty('--deel', links / (links + rechts));
    }

    element.append(...rij.secties.map(sectie => maakSectie(sectie, stijl)));
    return element;
}

function maakSectie(sectie, stijl) {
    const { patroon, schaal, uitlijning, id } = sectie.opties;
    const element = document.createElement('section');
    element.className = 'sectie';
    if (id) element.id = id;

    zetKleurrollen(element, sectie.opties, stijl);
    if (patroon) {
        element.classList.add('patroon');
        element.style.setProperty('--patroon', `url("${pad(patroon, sectie.basis)}")`);
    }
    if (schaal) element.style.setProperty('--schaal', schaal);
    if (uitlijning) {
        const verticaal = { boven: 'start', midden: 'center', onder: 'end' }[uitlijning];
        if (verticaal) element.style.setProperty('--uitlijning', verticaal);
        else throw new Error(`uitlijning=${uitlijning} bestaat niet; kies boven, midden of onder`);
    }

    element.innerHTML = `<div class="inhoud reveal">${delenNaarHtml(sectie.delen, sectie.basis)}</div>`;
    return element;
}

// Een sectie bestaat uit tekst, gevolgd door eventueel kaarten of tijdlijn-items.
// Opeenvolgende tijdlijn-items komen samen in één tijdlijn. Kaarten zonder lege regel
// ertussen komen naast elkaar in één rij; een lege regel vóór [kaart] begint een nieuwe rij.
function delenNaarHtml(delen, basis) {
    const eindigtLeeg = deel => deel.regels.at(-1)?.trim() === '';
    const groepen = [];
    for (const deel of delen) {
        const vorige = groepen.at(-1);
        const hoortBijVorige = vorige?.soort === deel.soort
            && !(deel.soort === 'kaart' && eindigtLeeg(vorige.delen.at(-1)));
        if (hoortBijVorige) vorige.delen.push(deel);
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

// De footer bestaat uit gewone rijen en secties.
function maakFooter(footer, stijl) {
    const element = document.createElement('footer');
    element.className = 'footer';
    element.append(...footer.rijen.map(rij => maakRij(rij, stijl)));
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

// Zodra een rij in beeld komt, vagen de blokken met .reveal erin één voor één in.
// Ze krijgen een volgnummer (0, 1, 2 …) in de volgorde van de pagina; de CSS laat elk
// volgend blok --reveal-stagger later beginnen. Komen meerdere rijen tegelijk in beeld
// (bij het laden), dan loopt de telling door over die rijen.
function activeerInvagen() {
    // Een rij telt als in beeld zodra de bovenkant boven de onderste 10% van het scherm komt,
    // ongeacht hoe hoog de rij is (rootMargin haalt die 10% van het scherm af).
    const waarnemer = new IntersectionObserver(items => {
        const rijen = items.filter(item => item.isIntersecting).map(item => item.target);
        const blokken = rijen.flatMap(rij => [...rij.querySelectorAll('.reveal')]);
        blokken.forEach((blok, volgorde) => {
            blok.style.setProperty('--volgorde', volgorde);
            blok.classList.add('visible');
        });
        rijen.forEach(rij => waarnemer.unobserve(rij));
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.rij').forEach(rij => waarnemer.observe(rij));
}


/* ─── 5. Opstarten ────────────────────────────────────────────────────────── */

// Een fout in de .md-bestanden komt als rode balk bovenaan de pagina, zodat je hem meteen ziet.
function toonFout(tekst) {
    console.error(tekst);
    document.body.prepend(Object.assign(document.createElement('p'), { className: 'fout', textContent: tekst }));
}

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
        const stijl = {
            kleuren: { ...site.kleuren, ...pagina.kleuren },
            themas: { ...site.themas, ...pagina.themas },
        };
        const menu = pagina.menu ?? site.menu;
        const footer = pagina.footer ?? site.footer;

        zetTitelEnBeschrijving(instellingen);
        zetKleuren(stijl.kleuren);
        zetKleurrollen(document.documentElement, { thema: instellingen.thema }, stijl);
        fontsGeladen = Promise.all([
            laadFont(instellingen['font-koppen'], '--font-koppen', ''),
            laadFont(instellingen['font-tekst'], '--font-tekst', ':wght@400;600'),
        ]);

        const main = document.createElement('main');
        main.append(...pagina.rijen.map(rij => maakRij(rij, stijl)));
        document.body.append(maakMenubalk(instellingen, menu, siteAdres), main);
        if (footer) document.body.append(maakFooter(footer, stijl));

        maakAnkers();
        openExterneLinksApart();
        activeerMenu();
    } catch (fout) {
        toonFout(`De pagina kon niet geladen worden: ${fout.message}`);
    } finally {
        // Wacht op de fonts (maximaal --font-wait ms), zodat de tekst niet verspringt.
        // Eerst de opmaak forceren: pas dan vraagt de browser de fonts van de nieuwe tekst aan.
        const fontWacht = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-wait'));
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
