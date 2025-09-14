import React, { useState } from 'react';
import Header from './components/Header';
import CaseSelection from './components/CaseSelection';
import StationOverview from './components/StationOverview';
import SeismogramViewer from './components/SeismogramViewer';
import ProgressTracker from './components/ProgressTracker';
import './App.css';

interface CaseData {
  id: string;
  name: string;
  description: string;
  stationCount: number;
  metadata: any;
}

interface Station {
  network: string;
  station: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  azimuth: number;
  p_arrival: number;
  s_arrival: number;
  surface_arrival: number;
}

interface StationData {
  pArrival: number;
  sArrival: number;
  maxAmplitude: number;
  station: Station;
}

type AppState = 'case-selection' | 'station-overview' | 'seismogram-viewer' | 'progress-tracker';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('case-selection');
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationData, setStationData] = useState<StationData[]>([]);

  const handleCaseSelected = (caseData: CaseData) => {
    setSelectedCase(caseData);
    setCurrentState('station-overview');
  };

  const handleStationSelected = (station: Station) => {
    setSelectedStation(station);
    setCurrentState('seismogram-viewer');
  };

  const handleDataEntered = (data: StationData) => {
    // Check if this station already has data
    const existingIndex = stationData.findIndex(
      item => item.station.network === data.station.network && 
               item.station.station === data.station.station
    );

    if (existingIndex >= 0) {
      // Update existing data
      const updatedData = [...stationData];
      updatedData[existingIndex] = data;
      setStationData(updatedData);
    } else {
      // Add new data
      setStationData([...stationData, data]);
    }

    setCurrentState('progress-tracker');
  };


  const handleBackToStations = () => {
    setCurrentState('station-overview');
    setSelectedStation(null);
  };

  const handleGoToEpicenter = () => {
    window.open('https://geoepicenter.dk', '_blank');
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case 'case-selection':
        return <CaseSelection onCaseSelected={handleCaseSelected} />;
      
      case 'station-overview':
        return selectedCase ? (
          <StationOverview
            caseData={selectedCase}
            onStationSelected={handleStationSelected}
            stationData={stationData}
          />
        ) : null;
      
      case 'seismogram-viewer':
        return selectedStation && selectedCase ? (
          <SeismogramViewer
            station={selectedStation}
            caseData={selectedCase}
            onDataEntered={handleDataEntered}
            onBackToStations={handleBackToStations}
          />
        ) : null;
      
      case 'progress-tracker':
        return selectedCase ? (
          <ProgressTracker
            caseData={selectedCase}
            stationData={stationData}
            onBackToStations={handleBackToStations}
            onGoToEpicenter={handleGoToEpicenter}
          />
        ) : null;
      
      default:
        return <CaseSelection onCaseSelected={handleCaseSelected} />;
    }
  };

  return (
    <div className="geoseis-app">
      <Header />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;