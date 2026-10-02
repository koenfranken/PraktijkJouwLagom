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

- Een `[rij]` heeft één of twee secties. Op mobiel staan ze onder elkaar.
- Bij twee secties blijft de kortste staan tijdens het scrollen (als hij op het scherm past).
- Opties schrijf je als `naam=waarde`, zonder spaties in de waarde, gescheiden door een spatie. Een onbekende waarde geeft een rode foutmelding bovenaan de pagina.

**Rij-opties**

| Optie | Mogelijke waarden | Zonder deze optie | Doet |
|---|---|---|---|
| `verhouding=` | twee getallen met `:`, bijv. `1:2`, `2:1`, `3:2` | `1:1` | Breedteverhouding van de linker en rechter sectie |

**Sectie-opties**

| Optie | Mogelijke waarden | Zonder deze optie | Doet |
|---|---|---|---|
| `thema=` | een thema uit `site.md`: `licht`, `groen`, `geel`, `rood`, `donker` | het thema uit `[site]` | Alle kleuren van de sectie |
| `achtergrond=`, `tekst=`, `koppen=`, `accent=`, `knoptekst=` | een kleur uit `[kleuren]`: `donker`, `licht`, `groen`, `rood`, `geel` | de kleur uit het thema | Eén rol van het thema overschrijven |
| `patroon=` | pad naar een SVG, zie de lijst hieronder | geen patroon | Herhaald patroon. Hetzelfde patroon in twee secties van een rij loopt naadloos door |
| `patroonkleur=` | een kleur uit `[kleuren]` | de achtergrondkleur, net iets donkerder (op licht) of lichter (op donker) | Kleur van het patroon |
| `sterkte=` | een getal groter dan 0, bijv. `0.5`, `2`, `4` | `1` | Hoe ver die automatische kleur van de achtergrond afwijkt. Doet niets samen met `patroonkleur=` |
| `schaal=` | een getal groter dan 0, bijv. `0.75`, `1.5`, `2` | `1` | Patroon kleiner of groter |
| `beweging=` | `drijven`, `pulseren` | stil | Patroon beweegt (alleen met `patroon=`): `drijven` schuift schuin op · `pulseren` komt op vanuit onzichtbaar en vervaagt weer. Alleen op een computer met muis (niet op telefoon of tablet), en niet voor bezoekers die minder beweging hebben ingesteld. Beweging kost rekenkracht: houd het bij één bewegende sectie per pagina en een licht patroon (zie hieronder) |
| `tempo=` | seconden, een getal groter dan 0, bijv. `8`, `30`, `60` | `5` | Duur van één tegel opschuiven (`drijven`) of één puls (`pulseren`) |
| `uitlijning=` | `boven`, `midden`, `onder` | `boven` | Tekst verticaal uitlijnen; zichtbaar als de andere sectie in de rij hoger is |
| `id=` | een woord, bijv. `aanbod` | het `[label]` van de sectie | Anker om naartoe te linken (`#aanbod`) |

**Patronen in `images/`**

| Bestand | Vorm | Doorzichtigheid in het bestand |
|---|---|---|
| `stippen.svg` | Regelmatige stippen | geen |
| `lijnen.svg` | Schuine lijnen | geen |
| `honingraat.svg` | Onvolledig zeshoekrooster met atomen en een enkel blaadje | deels (30–80%) |
| `verbonden.svg` | Molecuulringen en atomen, verbonden tot een net, hier en daar een blad | deels |
| `molecuulnet.svg` | Structuurformules: ringen en ketens met zijgroepen, één doorlopend net | deels |
| `molecuulnet-blad.svg` | Kleinere eigen molecuulstructuur met drie bladeren, verspreid over de tegel | deels |
| `zon.svg` | Kleine zonnetjes | 22% |
| `water.svg` | Golflijnen | 20% |
| `blad.svg` | Losse blaadjes | 35% |
| `kiezels.svg` | Steentjes | 22% |
| `lagom.svg` | De balken uit het logo | 25% |

De automatische patroonkleur is al subtiel. Bij een bestand dat zelf ook doorzichtig is (22–35%) blijft er dan bijna niets van over: gebruik daar `patroonkleur=` of een hoge `sterkte=`.

Belasting (gemeten in Edge en Firefox, met en zonder grafische kaart): een stilstaand patroon kost niets. `drijven` en `pulseren` lopen met alle patronen hierboven vloeiend, ook zonder grafische kaart. Op een trage laptop kost elke bewegende sectie zo'n 10–20% processortijd; de detailrijke patronen (`honingraat`, `verbonden`, `molecuulnet-blad`) zitten aan de bovenkant daarvan.

Een eigen patroon: een SVG met `width` en `height` (de tegelmaat), in één kleur. De kleur in het bestand doet er niet toe, alleen de vorm en de doorzichtigheid. Wat over de rand van de tegel steekt, moet aan de overkant terugkomen.

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
| `[html]` … `[/html]` | Gewone HTML, bijvoorbeeld een agenda of formulier van een andere website. Beide markeringen alleen op een regel. Scripts erin worden uitgevoerd |

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
