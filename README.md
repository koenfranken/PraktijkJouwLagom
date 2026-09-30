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
thema: licht                                       ← thema van de pagina, menubalk en secties zonder thema

[kleuren]
donker: #222020          ← het palet: eigen namen, als #rrggbb
licht: #F7F4EE
groen: #6F7D45
rood: #7F1D1A
geel: #D8A032

[thema groen]            ← een thema koppelt paletkleuren aan rollen; alle vijf verplicht
achtergrond: groen
tekst: licht
koppen: licht
accent: licht            ← labels, ==accent==, opsommingstekens, citaatstreep, tijdlijn, knoppen, onderstreping van links
knoptekst: groen         ← tekst op een knop (die de accentkleur heeft)
```

Verplicht zijn `titel`, `thema`, `font-koppen` en `font-tekst`. Ontbreekt er één, of klopt er iets niet (onbekende kleurnaam, fout in de opbouw), dan staat er een rode foutmelding bovenaan de pagina. Het menu is een lijst met links; de footer is vrije tekst:

```
[menu]
- [Aanbod](./#aanbod)
- [Voorwaarden](voorwaarden.html)
- [Contact](./#contact){.knop}      ← als knop in de accentkleur

[footer]
[rij verhouding=2:1]
[sectie thema=rood]
**Jouw Lagom** · orthomoleculaire therapie

[sectie thema=rood]
[a.b@c.com](mailto:a.b@c.com) · [Algemene voorwaarden](voorwaarden.html)
```

De footer bestaat uit gewone rijen en secties (zie hieronder), alleen met minder ruimte en een kleinere letter. Alles na `[footer]` hoort bij de footer, dus `[footer]` staat altijd als laatste in het bestand.

**Per pagina afwijken:** zet hetzelfde blok in de `.md` van die pagina. Bij `[site]` en `[kleuren]` gelden alleen de regels die je daar noemt; `[thema …]`, `[menu]` en `[footer]` worden in hun geheel vervangen.

## Rijen en secties

```
[rij verhouding=1:2]
[sectie thema=groen]
...tekst...
[sectie thema=geel accent=groen patroon=images/stippen.svg schaal=2]
...tekst...
```

- Een `[rij]` heeft één of twee secties. Twee secties staan standaard 50/50 naast elkaar; `verhouding=1:2` of `2:1` verandert dat. Op mobiel staan ze onder elkaar.
- Bij twee secties blijft de kortste staan tijdens het scrollen (als hij op het scherm past).
- Sectie-opties:

| Optie | Doet |
|---|---|
| `thema=groen` | Kleuren uit `[thema groen]`; zonder thema geldt het thema uit `[site]` |
| `achtergrond=`, `tekst=`, `koppen=`, `accent=`, `knoptekst=` | Eén rol van het thema overschrijven met een kleur uit `[kleuren]` |
| `patroon=images/stippen.svg` | Herhaald patroon; het bestand bepaalt de vorm en doorzichtigheid. Aanwezig: `stippen`, `lijnen`, `zon`, `water`, `blad`, `kiezels`, `lagom` (de balken uit het logo). Hetzelfde patroon in twee secties van een rij loopt naadloos door |
| `patroonkleur=groen` | Kleur van het patroon (standaard de accentkleur) |
| `schaal=2` | Patroon twee keer zo groot |
| `uitlijning=midden` | Tekst verticaal `boven` (standaard), in het `midden` of `onder`; zichtbaar als de andere sectie in de rij hoger is |
| `id=aanbod` | Anker om naartoe te linken; anders het `[label]` van de sectie |

## Tekst binnen een sectie

| Je typt | Resultaat |
|---|---|
| `# Kop`, `## Kop`, `### Kop` | Koppen; de eerste alinea na `#` of `##` wordt iets groter |
| `**vet**`, `*cursief*`, `==accent==` | Opmaak |
| `[tekst](adres)` | Link |
| `[tekst](adres){.knop}` | Knop (alleen op een regel). Knoppen op opeenvolgende regels staan naast elkaar: de eerste in de accentkleur, de rest doorzichtig. Een lege regel ertussen zet ze onder elkaar, elk in de accentkleur |
| `![omschrijving](images/foto.jpg)` | Afbeelding |
| `- punt`, `1. punt` | Lijsten |
| `> tekst` | Citaat |
| `[label Diensten]` | Klein label boven een kop |
| `[kaart]` | Tegel. Zonder lege regel vóór de volgende `[kaart]` staan ze naast elkaar, met een lege regel onder elkaar. Op mobiel altijd onder elkaar |
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
