import React, { useState, useEffect } from 'react';

interface CaseData {
  id: string;
  name: string;
  description: string;
  stationCount: number;
  metadata: any;
}

interface CaseSelectionProps {
  onCaseSelected: (caseData: CaseData) => void;
}

const CaseSelection: React.FC<CaseSelectionProps> = ({ onCaseSelected }) => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      
      // Load all 7 cases metadata
      const casePromises = [];
      for (let i = 1; i <= 7; i++) {
        casePromises.push(fetch(`./case ${i}/metadata.json`).then(res => res.json()));
      }
      
      const caseDataArray = await Promise.all(casePromises);

      const availableCases: CaseData[] = caseDataArray.map((caseData, index) => ({
        id: `case${index + 1}`,
        name: `Case ${index + 1}`,
        description: `Seismisk analyse øvelse - ${caseData.stations.length} stationer`,
        stationCount: caseData.stations.length,
        metadata: { 
          stations: caseData.stations,
          caseName: `case ${index + 1}`
        }
      }));

      setCases(availableCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = (caseId: string) => {
    setSelectedCase(caseId);
  };

  const handleStartCase = () => {
    const selectedCaseData = cases.find(c => c.id === selectedCase);
    if (selectedCaseData) {
      onCaseSelected(selectedCaseData);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Indlæser tilgængelige cases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>Vælg Seismisk Case</h2>
          <p>Vælg den case du vil arbejde med. Hver case indeholder seismisk data fra flere stationer.</p>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Vælg Case:</label>
            <select 
              className="form-select"
              value={selectedCase}
              onChange={(e) => handleCaseSelect(e.target.value)}
            >
              <option value="">-- Vælg en case --</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.name} ({caseItem.stationCount} stationer)
                </option>
              ))}
            </select>
          </div>

          {selectedCase && (
            <div className="alert alert-info">
              {(() => {
                const selectedCaseData = cases.find(c => c.id === selectedCase);
                return selectedCaseData ? (
                  <h4>{selectedCaseData.stationCount} stationer</h4>
                ) : null;
              })()}
            </div>
          )}

          <button 
            className="btn btn-primary"
            onClick={handleStartCase}
            disabled={!selectedCase}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Start Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseSelection;
