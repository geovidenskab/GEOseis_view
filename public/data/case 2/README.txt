# Triangulering Data

## Jordskælv Information
- ID: query?eventid=12001972
- Magnitude: 6.8
- Tid: 2025-08-03T05:37:55.148000
- Lokation: KURIL ISLANDS

## Stationer (6)
- 1. IU.MA2 (1097.2 km)
- 2. II.KDAK (3253.3 km)
- 3. II.TLY (3708.6 km)
- 4. IU.WAKE (3558.8 km)
- 5. IU.POHA (5317.3 km)
- 6. IU.ADK (1774.4 km)

## Data Struktur
Hver station har sin egen mappe med:
- station_info.json: Stationsinformation og metadata
- vertical_component.csv: Vertikal komponent (Z)
- north_component.csv: Nord komponent (N)  
- east_component.csv: Øst komponent (E)

## Tidsperiode
Data dækker fra 60 sekunder før jordskælv til 500 sekunder efter S-bølge ankomst.

## Format
CSV filer med kolonner: time, displacement
- time: Sekunder relativt til jordskælv tid
- displacement: Seismisk displacement i meter

Eksporteret: 2025-09-13 13:16:14
