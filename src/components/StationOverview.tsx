import React, { useState, useEffect, useCallback } from 'react';

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

interface CaseData {
  id: string;
  name: string;
  description: string;
  stationCount: number;
  metadata: any;
}

interface StationData {
  pArrival: number;
  sArrival: number;
  maxAmplitude: number;
  station: Station;
}

interface StationOverviewProps {
  caseData: CaseData;
  onStationSelected: (station: Station) => void;
  stationData: StationData[];
}

const StationOverview: React.FC<StationOverviewProps> = ({ 
  caseData, 
  onStationSelected, 
  stationData
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if a station has been analyzed
  const isStationAnalyzed = (station: Station): boolean => {
    return stationData.some(data => 
      data.station.network === station.network && 
      data.station.station === station.station
    );
  };

  const loadStations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: caseData received
      
      // Load stations from metadata
      const stationsData = caseData.metadata.stations.map((station: any) => ({
        network: station.network,
        station: station.station,
        latitude: station.latitude,
        longitude: station.longitude,
        distance_km: station.distance_km,
        azimuth: station.azimuth,
        p_arrival: station.p_arrival,
        s_arrival: station.s_arrival,
        surface_arrival: station.surface_arrival
      }));

      setStations(stationsData);
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  }, [caseData]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Indlæser stationer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Stationer for {caseData.name}</h2>
          <p>Klik på en station for at analysere seismisk data</p>
        </div>
        <div className="card-body">

          <div className="row">
            {stations.map((station, index) => (
              <div key={`${station.network}.${station.station}`} className="col-6 col-4">
                <div 
                  className="card station-card"
                  onClick={() => onStationSelected(station)}
                  style={{ 
                    marginBottom: '1rem',
                    border: isStationAnalyzed(station) ? '3px solid #28a745' : '1px solid #dee2e6',
                    backgroundColor: isStationAnalyzed(station) ? '#f8fff9' : 'white'
                  }}
                >
                  <div className="card-body">
                    <h4>Station {index + 1}</h4>
                    <h5>{station.network}.{station.station}</h5>
                    {isStationAnalyzed(station) && (
                      <div style={{ 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        marginBottom: '10px',
                        display: 'inline-block'
                      }}>
                        Analyseret
                      </div>
                    )}
                    
                    <div style={{ marginTop: '1rem' }}>
                      <p><strong>Koordinater:</strong></p>
                      <p>Breddegrad: {station.latitude.toFixed(4)}°</p>
                      <p>Længdegrad: {station.longitude.toFixed(4)}°</p>
                      
                    </div>

                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <button className="btn btn-primary" style={{ width: '100%' }}>
                        Analyser Seismisk Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
};

export default StationOverview;
