import React, { useState, useEffect, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';

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

interface SeismogramViewerProps {
  station: Station;
  caseData: any;
  onDataEntered: (data: {
    pArrival: number;
    sArrival: number;
    maxAmplitude: number;
    station: Station;
  }) => void;
  onBackToStations: () => void;
}

const SeismogramViewer: React.FC<SeismogramViewerProps> = ({
  station,
  caseData,
  onDataEntered,
  onBackToStations
}) => {
  const [waveformData, setWaveformData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pArrival, setPArrival] = useState<number>(0);
  const [sArrival, setSArrival] = useState<number>(0);
  const [maxAmplitude, setMaxAmplitude] = useState<number>(0);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [plotLayout, setPlotLayout] = useState<any>({});
  const [activeMode, setActiveMode] = useState<'p' | 's' | 'amplitude' | null>(null);
  const [amplitudeMarkerTime, setAmplitudeMarkerTime] = useState<number>(0);
  const [showAmplitudePrompt, setShowAmplitudePrompt] = useState<boolean>(false);
  const plotRef = useRef<any>(null);

  const loadCSVComponent = useCallback(async (filename: string) => {
    try {
      const url = `/${encodeURIComponent(caseData.metadata.caseName)}/${filename}`;
      console.log('Fetching CSV from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log(`CSV loaded for ${filename}, length:`, csvText.length);
      
      const lines = csvText.split('\n').filter(line => line.trim());
      console.log(`CSV lines count for ${filename}:`, lines.length);
      
      // Skip header line
      const dataLines = lines.slice(1);
      
      const time: number[] = [];
      const displacement: number[] = [];
      
      dataLines.forEach(line => {
        const [timeStr, displacementStr] = line.split(',');
        if (timeStr && displacementStr) {
          time.push(parseFloat(timeStr));
          displacement.push(parseFloat(displacementStr));
        }
      });
      
      console.log(`Parsed data points for ${filename}:`, time.length);
      
      return { time, displacement };
    } catch (error) {
      console.error(`Error loading CSV component ${filename}:`, error);
      throw error;
    }
  }, [caseData]);

  const loadRealCSVData = useCallback(async () => {
    try {
      console.log('Loading CSV data for station:', station);
      console.log('Case data:', caseData);
      
      // Find the station folder in the case data
      const stationIndex = caseData.metadata.stations.findIndex((s: any) => 
        s.network === station.network && s.station === station.station
      );
      console.log('Station index found:', stationIndex);
      
      const stationFolder = `station_${String(stationIndex + 1).padStart(2, '0')}_${station.network}_${station.station}`;
      console.log('Station folder:', stationFolder);
      
      // Load CSV files for all three components
      const [verticalData, northData, eastData] = await Promise.all([
        loadCSVComponent(`${stationFolder}/vertical_component.csv`),
        loadCSVComponent(`${stationFolder}/north_component.csv`),
        loadCSVComponent(`${stationFolder}/east_component.csv`)
      ]);
      
      console.log('All CSV data loaded successfully');
      
      return {
        time: verticalData.time,
        vertical: verticalData.displacement,
        north: northData.displacement,
        east: eastData.displacement,
        samplingRate: 40 // From station_info.json
      };
    } catch (error) {
      console.error('Error loading CSV data:', error);
      throw error;
    }
  }, [station, caseData, loadCSVComponent]);

  const loadWaveformData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load real CSV data from the case files
      const waveformData = await loadRealCSVData();
      setWaveformData(waveformData);
      
    } catch (error) {
      console.error('Error loading waveform data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadRealCSVData]);

  useEffect(() => {
    loadWaveformData();
  }, [loadWaveformData]);


  const updatePlot = useCallback(() => {
    if (!waveformData) return;

    // Calculate min/max values efficiently without spreading large arrays
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    for (let i = 0; i < waveformData.vertical.length; i++) {
      minValue = Math.min(minValue, waveformData.vertical[i], waveformData.north[i], waveformData.east[i]);
      maxValue = Math.max(maxValue, waveformData.vertical[i], waveformData.north[i], waveformData.east[i]);
    }
    const range = maxValue - minValue;
    const yMin = minValue - range * 0.2;
    const yMax = maxValue + range * 0.2;

    const traces = [
      {
        x: waveformData.time,
        y: waveformData.vertical, // Already in mm
        type: 'scatter',
        mode: 'lines',
        name: 'Vertikal (Z)',
        line: { color: '#1f77b4', width: 1 }
      },
      {
        x: waveformData.time,
        y: waveformData.north, // Already in mm
        type: 'scatter',
        mode: 'lines',
        name: 'Nord-Syd (N)',
        line: { color: '#ff7f0e', width: 1 }
      },
      {
        x: waveformData.time,
        y: waveformData.east, // Already in mm
        type: 'scatter',
        mode: 'lines',
        name: 'Øst-Vest (E)',
        line: { color: '#2ca02c', width: 1 }
      }
    ];

    // Add P wave marker
    if (pArrival > 0) {
      traces.push({
        x: [pArrival, pArrival],
        y: [yMin, yMax],
        type: 'scatter',
        mode: 'lines',
        name: 'P-bølge',
        line: { color: '#007bff', width: 3 }
      });
      // P-bølge text label will be added as annotation
    }

    // Add S wave marker
    if (sArrival > 0) {
      traces.push({
        x: [sArrival, sArrival],
        y: [yMin, yMax],
        type: 'scatter',
        mode: 'lines',
        name: 'S-bølge',
        line: { color: '#6f42c1', width: 3 }
      });
      // S-bølge text label will be added as annotation
    }

    // Add amplitude marker - vertical line where user marked
    if (amplitudeMarkerTime > 0) {
      traces.push({
        x: [amplitudeMarkerTime, amplitudeMarkerTime],
        y: [yMin, yMax],
        type: 'scatter',
        mode: 'lines',
        name: 'Amplitude marker',
        line: { color: 'rgba(255, 0, 0, 0.15)', width: 10 }
      });
    }

    // Add amplitude marker - horizontal dashed line across entire graph
    if (maxAmplitude > 0) {
      // Get x-axis range from data
      const xMin = Math.min(...waveformData.time);
      const xMax = Math.max(...waveformData.time);
      
      // Horizontal dashed line across entire graph
      traces.push({
        x: [xMin, xMax],
        y: [maxAmplitude, maxAmplitude],
        type: 'scatter',
        mode: 'lines',
        name: 'Maksimal amplitude',
        line: { color: 'rgba(255, 0, 0, 0.5)', width: 1 }
      });
      
      // Also add negative amplitude line
      traces.push({
        x: [xMin, xMax],
        y: [-maxAmplitude, -maxAmplitude],
        type: 'scatter',
        mode: 'lines',
        name: 'Maksimal amplitude (negativ)',
        line: { color: 'rgba(255, 0, 0, 0.5)', width: 1 }
      });
    }

    // Create annotations for P and S wave labels
    const annotations: any[] = [];
    if (pArrival > 0) {
      annotations.push({
        x: pArrival,
        y: yMax * 1.1,
        text: 'P-bølge',
        showarrow: false,
        font: { color: '#007bff', size: 14, family: 'Arial' },
        xanchor: 'center',
        yanchor: 'top'
      });
    }
    if (sArrival > 0) {
      annotations.push({
        x: sArrival,
        y: yMax * 1.,
        text: 'S-bølge',
        showarrow: false,
        font: { color: '#6f42c1', size: 14, family: 'Arial' },
        xanchor: 'center',
        yanchor: 'bottom'
      });
    }

    const layout = {
      title: {
        text: `Seismogram fra station: ${station.station} | Koordinater: ${station.latitude.toFixed(2)}°${station.latitude >= 0 ? 'N' : 'S'}, ${station.longitude.toFixed(2)}°${station.longitude >= 0 ? 'Ø' : 'V'}`,
        font: { size: 18, weight: 'normal' },
        x: 0.5,
        y: 1.5,
        xanchor: 'center',
        yanchor: 'top'
      },
      xaxis: {
        title: {
          text: 'Tid (s)',
          font: { size: 14, weight: 'normal', color: '#333' },
          standoff: 20
        },
        range: [0, 1200],
        dtick: 100,
        tick0: 0,
        gridcolor: '#f0f0f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#ccc',
        tickfont: { size: 12 },
        showticklabels: true,
        showline: true,
        linewidth: 2,
        linecolor: '#333333',
        mirror: true
      },
      yaxis: {
        title: {
          text: 'Forskydning (mm)',
          font: { size: 14, weight: 'normal', color: '#333' },
          standoff: 20
        },
        autorange: true,
        gridcolor: '#f0f0f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#ccc',
        tickfont: { size: 12 },
        showticklabels: true,
        showline: true,
        linewidth: 2,
        linecolor: '#333333',
        mirror: true
      },
      hovermode: 'x unified',
      showlegend: true,
      legend: {
        x: 0.99,
        y: 0.99,
        xanchor: 'right',
        yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#ccc',
        borderwidth: 1
      },
      margin: { l: 100, r: 80, t: 50, b: 60 },
      height: 500,
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      annotations: annotations
    };

    setPlotData(traces);
    setPlotLayout(layout);
  }, [waveformData, pArrival, sArrival, maxAmplitude, amplitudeMarkerTime, station.station, station.latitude, station.longitude]);

  useEffect(() => {
    if (waveformData) {
      updatePlot();
    }
  }, [waveformData, updatePlot]);

  // Removed unused handler functions - now using click mode

  const handlePlotClick = (event: any) => {
    if (!activeMode || !waveformData) return;
    
    const clickedTime = event.points[0].x;
    
    if (activeMode === 'p') {
      // Show marker on graph, but don't auto-fill input field
      setPArrival(clickedTime);
    } else if (activeMode === 's') {
      // Show marker on graph, but don't auto-fill input field
      setSArrival(clickedTime);
    } else if (activeMode === 'amplitude') {
      // Mark the time where user thinks max amplitude is
      setAmplitudeMarkerTime(clickedTime);
      setShowAmplitudePrompt(true);
      console.log('Amplitude marker set at time:', clickedTime);
      
      // Auto-zoom to the marked time point
      setTimeout(() => {
        if (plotRef.current && plotRef.current.layout) {
          const zoomRange = 20; // 20 seconds around the marked point
          const xMin = Math.max(0, clickedTime - zoomRange);
          const xMax = Math.min(1200, clickedTime + zoomRange);
          
          // Update the layout directly
          const newLayout = {
            ...plotLayout,
            xaxis: {
              ...plotLayout.xaxis,
              range: [xMin, xMax]
            }
          };
          setPlotLayout(newLayout);
        }
      }, 100);
    }
    
    // Reset active mode after clicking
    setActiveMode(null);
  };

  const handleSubmitData = () => {
    onDataEntered({
      pArrival,
      sArrival,
      maxAmplitude,
      station
    });
  };


  if (loading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Indlæser seismisk data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-body">
          {/* Kompakt kontrol sektion øverst */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 'bold', color: '#495057' }}>
                Klik på grafen for at markere:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className={`btn ${activeMode === 'p' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveMode(activeMode === 'p' ? null : 'p')}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    border: '2px solid #007bff',
                    boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {activeMode === 'p' ? 'Klik på P-bølge' : 'Markér P-bølge'}
                </button>
                <button 
                  className={`btn ${activeMode === 's' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveMode(activeMode === 's' ? null : 's')}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    border: '2px solid #6f42c1',
                    boxShadow: '0 2px 4px rgba(111, 66, 193, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {activeMode === 's' ? 'Klik på S-bølge' : 'Markér S-bølge'}
                </button>
                <button 
                  className={`btn ${activeMode === 'amplitude' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveMode(activeMode === 'amplitude' ? null : 'amplitude')}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    border: '2px solid #dc3545',
                    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {activeMode === 'amplitude' ? 'Klik på max amplitude' : 'Markér max amplitude'}
                </button>
              </div>
            </div>
            
            {activeMode && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1976d2'
              }}>
                <strong>Instruktion:</strong> Klik på grafen der hvor du mener {activeMode === 'p' ? 'P-bølgen' : activeMode === 's' ? 'S-bølgen' : 'den maksimale amplitude'} er.
              </div>
            )}

            {showAmplitudePrompt && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem', 
                backgroundColor: '#fff3cd', 
                borderRadius: '4px',
                border: '1px solid #ffeaa7'
              }}>
                <strong>Indtast amplitude:</strong> Du har markeret tidspunkt {amplitudeMarkerTime.toFixed(1)}s. Indtast den maksimale amplitude (mm):
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Amplitude (mm)"
                    style={{ 
                      padding: '6px 10px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      width: '120px',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseFloat((e.target as HTMLInputElement).value);
                        if (!isNaN(value)) {
                          setMaxAmplitude(Math.abs(value));
                          setShowAmplitudePrompt(false);
                          setAmplitudeMarkerTime(0);
                        }
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      const value = parseFloat(input?.value || '0');
                      if (!isNaN(value)) {
                        setMaxAmplitude(Math.abs(value));
                        setShowAmplitudePrompt(false);
                        setAmplitudeMarkerTime(0);
                      }
                    }}
                  >
                    Bekræft
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => {
                      setShowAmplitudePrompt(false);
                      setAmplitudeMarkerTime(0);
                    }}
                  >
                    Annuller
                  </button>
                </div>
              </div>
            )}

            <div style={{ 
              marginTop: '0.75rem', 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap',
              fontSize: '13px'
            }}>
              <div style={{ color: '#6c757d' }}>
                <strong>Tip:</strong> Zoom ind for præcis aflæsning
              </div>
              <div style={{ color: '#28a745' }}>
                <strong>Resultater:</strong> Samles i skemaet nedenfor
              </div>
            </div>
          </div>

          <div className="plotly-container" style={{ marginTop: '0.5rem' }}>
            <Plot
              ref={plotRef}
              data={plotData}
              layout={plotLayout}
              style={{ width: '100%', height: '100%' }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToAdd: ['toggleSpikelines'],
                modeBarButtonsToRemove: ['resetScale2d', 'toImage']
              }}
              onClick={handlePlotClick}
            />
          </div>

          <div className="data-entry-form">
            <h3>Dine Målinger</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">P-bølge ankomsttid (s)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={pArrival > 0 ? pArrival.toFixed(2) : ''}
                  onChange={(e) => setPArrival(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">S-bølge ankomsttid (s)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={sArrival > 0 ? sArrival.toFixed(2) : ''}
                  onChange={(e) => setSArrival(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maksimal amplitude (mm)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={maxAmplitude > 0 ? maxAmplitude.toFixed(2) : ''}
                  onChange={(e) => setMaxAmplitude(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Station koordinater</label>
                <input
                  type="text"
                  className="form-control"
                  value={`${station.latitude.toFixed(4)}°, ${station.longitude.toFixed(4)}°`}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Navn</label>
                <input
                  type="text"
                  className="form-control"
                  value={station.station}
                  readOnly
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                className="btn btn-success"
                onClick={handleSubmitData}
                disabled={pArrival === 0 || sArrival === 0 || maxAmplitude === 0}
                style={{ 
                  marginRight: '1rem',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  boxShadow: '0 3px 6px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.2s ease',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  if (!target.disabled) {
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = '0 5px 12px rgba(40, 167, 69, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  if (!target.disabled) {
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 3px 6px rgba(40, 167, 69, 0.3)';
                  }
                }}
              >
                Gem Data
              </button>
              
              
              <button 
                className="btn btn-secondary"
                onClick={onBackToStations}
                style={{ 
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  boxShadow: '0 3px 6px rgba(108, 117, 125, 0.3)',
                  transition: 'all 0.2s ease',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 5px 12px rgba(108, 117, 125, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 3px 6px rgba(108, 117, 125, 0.3)';
                }}
              >
                Tilbage til Stationer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SeismogramViewer;
