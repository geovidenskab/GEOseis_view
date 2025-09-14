import React from 'react';

interface HeaderProps {
  // No props needed anymore
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="title-section">
          <div className="app-icon">🌍</div>
          <div>
            <h1 className="app-title">GeoSeis-View</h1>
            <p className="app-subtitle">seismisk analyse til triangulering</p>
          </div>
        </div>

        <div className="header-actions">
          <a 
            href="https://geovidenskab.github.io/epicenter/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              marginRight: '1rem',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'normal',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLAnchorElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLAnchorElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              target.style.color = 'white';
            }}
          >
            GEOseis-Epicenter
          </a>
          <div className="version-info">
            <span className="version-text">v1.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
