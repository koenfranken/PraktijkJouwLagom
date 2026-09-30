# Website-template

Statische website zonder bouwstap. Alle tekst en instellingen staan in `.md`-bestanden die je gewoon in GitHub bewerkt (potloodje → wijzigen → *Commit changes*). Binnen een minuut staat het online.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `site.md` | Instellingen voor de hele site: naam, logo, kleuren, fonts, menu, footer |
| `index.md`, `voorwaarden.md` | De inhoud van een pagina |
| `index.html`, `voorwaarden.html` | Vaste HTML; zegt alleen welke `.md`-bestanden de pagina gebruikt |
| `images/` | Logo, foto's en patronen |
| `code/` | `script.js` (leest de `.md`-bestanden) en `styles.css` |
| `.nojekyll` | Leeg bestand; voorkomt dat GitHub de `.md`-bestanden zelf omzet |

Tekst vóór de eerste `[markering]` in een `.md`-bestand wordt niet getoond; handig voor notities.

## Site-instellingen

```
[site]
naam: Jouw Lagom
logo: images/logo.svg
titel: Jouw Lagom · orthomoleculaire therapie     ← tabblad en Google
beschrijving: Korte omschrijving voor Google.
font-koppen: Young Serif                           ← naam zoals op fonts.google.com
font-tekst: Instrument Sans

[kleuren]
achtergrond: #F7F4EE     ← vaste namen: achtergrond, tekst, koppen, accent
tekst: #222020
koppen: #7F1D1A
accent: #D8A032          ← knoppen, labels, ==accent==, onderstreping van links
olijf: #6F7D45           ← eigen namen, te gebruiken in secties
```

Kleuren schrijf je als `#rrggbb`. Het menu is een lijst met links; de footer is vrije tekst:

```
[menu]
- [Aanbod](./#aanbod)
- [Voorwaarden](voorwaarden.html)

[footer]
**Jouw Lagom** · [Algemene voorwaarden](voorwaarden.html)
```

**Per pagina afwijken:** zet hetzelfde blok in de `.md` van die pagina. Bij `[site]` en `[kleuren]` gelden alleen de regels die je daar noemt; `[menu]` en `[footer]` worden in hun geheel vervangen.

## Rijen en secties

```
[rij verhouding=1:2]
[sectie achtergrond=olijf]
...tekst...
[sectie achtergrond=licht patroon=images/stippen.svg patroonkleur=olijf schaal=2]
...tekst...
```

- Een `[rij]` heeft één of twee secties. Twee secties staan standaard 50/50 naast elkaar; `verhouding=1:2` of `2:1` verandert dat. Op mobiel staan ze onder elkaar.
- Bij twee secties blijft de kortste staan tijdens het scrollen (als hij op het scherm past).
- Sectie-opties:

| Optie | Doet |
|---|---|
| `achtergrond=olijf` | Kleur uit `[kleuren]`; op een donkere kleur wordt de tekst automatisch licht |
| `tekst=rood` | Tekstkleur zelf kiezen |
| `patroon=images/stippen.svg` | Herhaald patroon; het bestand bepaalt de vorm en doorzichtigheid |
| `patroonkleur=olijf` | Kleur van het patroon (standaard de tekstkleur) |
| `schaal=2` | Patroon twee keer zo groot |
| `id=aanbod` | Anker om naartoe te linken; anders het `[label]` van de sectie |

## Tekst binnen een sectie

| Je typt | Resultaat |
|---|---|
| `# Kop`, `## Kop`, `### Kop` | Koppen; de eerste alinea na `#` of `##` wordt iets groter |
| `**vet**`, `*cursief*`, `==accent==` | Opmaak |
| `[tekst](adres)` | Link; staat hij alléén op een regel, dan wordt het een knop |
| `![omschrijving](images/foto.jpg)` | Afbeelding |
| `- punt`, `1. punt` | Lijsten |
| `> tekst` | Citaat |
| `[label Diensten]` | Klein label boven een kop |
| `[kaart]` | Tegel; opeenvolgende kaarten staan naast elkaar |
| `[tijdlijn 2020 – heden]` | Item in een tijdlijn |

Een kaart of tijdlijn-item loopt door tot de volgende `[markering]`. Een lege regel begint een nieuwe alinea.

Elke kop krijgt een anker: kleine letters, streepjes in plaats van spaties: `## 1. Definities` → `#1-definities`.

Paden (`images/…`, `voorwaarden.html`) schrijf je vanaf de plek van het `.md`-bestand.

## Nieuwe pagina

1. Kopieer `voorwaarden.html` naar `nieuw.html` en zet daarin `data-md="nieuw.md"`.
2. Maak `nieuw.md` met rijen en secties.
3. Zet een link in `[menu]` in `site.md`.

## Lokaal bekijken

```powershell
python -m http.server 8000
```

Open http://localhost:8000. Dubbelklikken op een `.html`-bestand werkt niet: de `.md`-bestanden worden met `fetch()` geladen, en dat heeft een server nodig.

## Publiceren via GitHub Pages

1. **Settings → Pages →** *Deploy from a branch*, `main`, `/ (root)`.
2. Eigen domein: maak een `CNAME`-bestand met één regel (bijvoorbeeld `jouwlagom.nl`) en een DNS-record naar `<gebruiker>.github.io`.

## Animaties

Het invagen is in te stellen bovenaan `code/styles.css`: `--fade`, `--reveal-duration`, `--reveal-distance`, `--reveal-stagger`, `--reveal-ease` en `--font-wait`.

> De algemene voorwaarden zijn voorbeeldtekst. Laat ze controleren voordat je ze gebruikt.
