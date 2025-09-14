# Triangulering Data

## Jordskælv Information
- ID: query?eventid=10402114
- Magnitude: 8.1
- Tid: 2017-09-08T04:49:20
- Lokation: NEAR COAST OF CHIAPAS, MEXICO

## Stationer (5)
- 1. IU.TEIG (828.7 km)
- 2. IU.ANMO (2538.2 km)
- 3. IU.OTAV (2360.0 km)
- 4. IU.SJG (2978.9 km)
- 5. IU.LVC (4976.9 km)

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

Eksporteret: 2025-09-13 13:11:40
