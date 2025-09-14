# Triangulering Data

Dette er seismisk data for triangulering af jordskælv.

## Jordskælv Information
- ID: query?eventid=11999904
- Tid: 2025-07-29T23:24:52.480000
- Magnitude: 8.8
- Lokation: OFF EAST COAST OF KAMCHATKA

## Stationer
5 stationer inkluderet

## Fil Struktur
- metadata.json: Jordskælv og station metadata
- station_XX_NETWORK_STATION/: Mappe for hver station
  - station_info.json: Station information
  - vertical_component.csv: Z-komponent waveform data
  - north_component.csv: N-komponent waveform data  
  - east_component.csv: E-komponent waveform data

## Data Format
CSV filer indeholder:
- time: Tid i sekunder fra jordskælv
- displacement: Udslag i meter

Genereret: 2025-09-14 20:49:22
