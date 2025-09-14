# Triangulering Data

Dette er seismisk data for triangulering af jordskælv.

## Jordskælv Information
- ID: query?eventid=488488
- Tid: 1996-02-17T05:59:31.970000
- Magnitude: 8.1
- Lokation: IRIAN JAYA REGION, INDONESIA

## Stationer
6 stationer inkluderet

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

Genereret: 2025-09-14 20:33:41
