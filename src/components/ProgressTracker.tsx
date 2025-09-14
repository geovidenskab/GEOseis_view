import React from 'react';
import * as XLSX from 'xlsx';

interface StationData {
  pArrival: number;
  sArrival: number;
  maxAmplitude: number;
  station: {
    network: string;
    station: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    azimuth: number;
  };
}

interface ProgressTrackerProps {
  caseData: any;
  stationData: StationData[];
  onBackToStations: () => void;
  onGoToEpicenter: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  caseData,
  stationData,
  onBackToStations,
  onGoToEpicenter
}) => {
  const completedStations = stationData.length;
  const totalStations = caseData.metadata.stations.length;
  const progressPercentage = (completedStations / totalStations) * 100;

  const exportDataForEpicenter = () => {
    const epicenterData = stationData.map(data => ({
      'Station': `${data.station.network}.${data.station.station}`,
      'Breddegrad': data.station.latitude,
      'Længdegrad': data.station.longitude,
      'P-bølge ankomsttid (s)': data.pArrival,
      'S-bølge ankomsttid (s)': data.sArrival,
      'Maksimal amplitude (mm)': data.maxAmplitude
    }));

    try {
      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(epicenterData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Seismisk Data');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `seismisk_data_${caseData.metadata.caseName}_${timestamp}.xlsx`;

      // Save Excel file
      XLSX.writeFile(wb, filename);
      
      console.log('Excel file exported successfully:', filename);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      
      // Fallback to JSON export if Excel fails
      const dataStr = JSON.stringify(epicenterData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seismic_data_${caseData.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Fremgang - {caseData.name}</h2>
          <p>Oversigt over dine analyserede stationer</p>
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            <h4>Fremgang:</h4>
            <p><strong>Fuldførte stationer:</strong> {completedStations} / {totalStations}</p>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#E9ECEF', 
              borderRadius: '4px', 
              height: '20px',
              marginTop: '0.5rem'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                backgroundColor: progressPercentage === 100 ? '#28a745' : '#007bff',
                height: '100%',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {progressPercentage.toFixed(1)}% fuldført
            </p>
          </div>

          {completedStations > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <h3>Analyserede Stationer</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Station</th>
                        <th>Koordinater</th>
                        <th>P-bølge (s)</th>
                        <th>S-bølge (s)</th>
                        <th>Max Amplitude (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationData.map((data, index) => (
                        <tr key={`${data.station.network}.${data.station.station}`}>
                          <td>{data.station.network}.{data.station.station}</td>
                          <td>
                            {data.station.latitude.toFixed(4)}°, {data.station.longitude.toFixed(4)}°
                          </td>
                          <td>{data.pArrival.toFixed(1)}</td>
                          <td>{data.sArrival.toFixed(1)}</td>
                          <td>{data.maxAmplitude.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="alert alert-warning">
            <h4>Næste Skridt:</h4>
            {completedStations < totalStations ? (
              <div>
                <p>Du har analyseret {completedStations} af {totalStations} stationer.</p>
                <p>Fortsæt med at analysere de resterende stationer for at få det bedste resultat.</p>
              </div>
            ) : (
              <div>
                <p>Fantastisk! Du har analyseret alle {totalStations} stationer.</p>
                <p>Nu kan du bruge disse data til at finde epicenteret på geoepicenter siden.</p>
              </div>
            )}
          </div>


          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {completedStations >= 3 && (
              <button 
                className="btn btn-success"
                onClick={exportDataForEpicenter}
                style={{ marginRight: '1rem' }}
              >
                📥 Download Data til Epicenter
              </button>
            )}
            
            {completedStations >= 3 && (
              <button 
                className="btn btn-primary"
                onClick={onGoToEpicenter}
                style={{ marginRight: '1rem' }}
              >
                🌍 Gå til GeoEpicenter
              </button>
            )}
            
            <button 
              className="btn btn-secondary"
              onClick={onBackToStations}
            >
              Tilbage til Stationer
            </button>
          </div>

          {completedStations < 3 && (
            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
              <p><strong>Bemærk:</strong> Du skal analysere mindst 3 stationer for at kunne lave triangulering.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
