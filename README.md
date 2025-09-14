# GEO-SeismicViewer

En React-baseret hjemmeside til seismisk data analyse og triangulering for undervisningsformål.

## Beskrivelse

GEO-SeismicViewer er designet til at give elever mulighed for at analysere seismisk data fra forskellige stationer og identificere P-bølge og S-bølge ankomsttider samt maksimal amplitude. Dette data kan derefter bruges til triangulering på geoepicenter siden.

## Funktioner

### 1. Case Valg
- Vælg mellem forskellige seismiske cases
- Hver case indeholder data fra flere stationer
- Viser case information uden at afsløre earthquake detaljer

### 2. Station Oversigt
- Viser alle tilgængelige stationer for den valgte case
- Viser kun geografiske koordinater og afstand
- Ingen information om earthquake eller ankomsttider

### 3. Seismogram Viewer
- Interaktiv seismogram med tre komponenter (Z, N, E)
- Sliders til at markere P-bølge og S-bølge ankomsttider
- Amplitude slider til at finde maksimal amplitude
- Real-time opdatering af markers på grafen

### 4. Data Indtastning
- Form til at indtaste målinger
- Automatisk beregning af amplitude
- Validering af indtastede data

### 5. Fremgangs Tracking
- Oversigt over analyserede stationer
- Progress bar og statistikker
- Tabel med alle målinger
- Export funktionalitet til JSON

### 6. Epicenter Integration
- Download af data til geoepicenter
- Direkte link til geoepicenter siden
- JSON format kompatibelt med geoepicenter

## Teknisk Stack

- **React 19** med TypeScript
- **Plotly.js** til seismogram visualisering
- **CSS3** med custom styling (samme som andre GEO sider)
- **JSON** til data storage og export

## Installation

```bash
cd /Users/Philip/GEO_site/seismicviewer-app
npm install
npm start
```

## Data Struktur

### Case Metadata
```json
{
  "earthquake": {
    "id": "query?eventid=10402114",
    "time": "2017-09-08T04:49:20",
    "latitude": 15.0356,
    "longitude": -93.9067,
    "depth": 56.67,
    "magnitude": 8.1,
    "location": "NEAR COAST OF CHIAPAS, MEXICO"
  },
  "stations": [...]
}
```

### Station Data
```json
{
  "network": "IU",
  "station": "TEIG",
  "latitude": 20.22624,
  "longitude": -88.27633,
  "distance_km": 828.7,
  "azimuth": 45.3,
  "p_arrival": 105.929,
  "s_arrival": 189.666,
  "surface_arrival": 236.765
}
```

## Bruger Flow

1. **Case Valg**: Vælg en seismisk case at arbejde med
2. **Station Oversigt**: Se alle tilgængelige stationer
3. **Seismogram Analyse**: Klik på en station for at analysere data
4. **Data Indtastning**: Mål P/S ankomsttider og amplitude
5. **Fremgang**: Se oversigt over analyserede stationer
6. **Export**: Download data til geoepicenter
7. **Triangulering**: Brug geoepicenter til at finde epicenteret

## Sikkerhed

- Ingen earthquake information vises til eleverne
- Ingen ankomsttider eller hints i seismogrammet
- Kun geografiske koordinater og afstand vises
- Elever skal selv identificere alle værdier

## Styling

Anvender samme design system som andre GEO React hjemmesider:
- Blå gradient header
- Card-baseret layout
- Responsive design
- Material Design inspireret buttons
- Konsistent farvepalette

## Udvikling

Projektet er oprettet med Create React App og TypeScript template. Alle komponenter er skrevet i TypeScript for bedre type safety.

### Komponenter

- `Header.tsx` - Navigation header
- `CaseSelection.tsx` - Case valg side
- `StationOverview.tsx` - Station oversigt
- `SeismogramViewer.tsx` - Seismogram analyse
- `ProgressTracker.tsx` - Fremgangs tracking

### Styling

- `index.css` - Global styling (samme som andre GEO sider)
- `App.css` - App-specifik styling
- Responsive design med CSS Grid og Flexbox

## Deployment

```bash
npm run build
```

Build filerne kan deployes til enhver statisk web server.

## Integration

Integreret med:
- **GEOSeis21** - Data eksport
- **GeoEpicenter** - Triangulering
- **GEO-Tsunami** - Samme design system