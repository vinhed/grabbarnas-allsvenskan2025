// src/components/MobileOptimizedTable.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

/**
 * A mobile-optimized table component that displays data in a card layout on small screens
 * and a traditional table on larger screens
 */
const MobileOptimizedTable = ({ 
  data, 
  columns, 
  id, 
  title, 
  description,
  rowClassName,
  highlightTeam,
  supportedTeams = {},
  teamLogos = {}
}) => {
  const [displayMode, setDisplayMode] = useState('table');
  const [expandedRows, setExpandedRows] = useState([]);
  
  // Determine display mode based on screen width
  useEffect(() => {
    const handleResize = () => {
      setDisplayMode(window.innerWidth <= 576 ? 'cards' : 'table');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Toggle a row's expanded state
  const toggleRowExpanded = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter(i => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };
  
  // Helper to determine if a cell should be highlighted
  const shouldHighlightCell = (rowData, colKey) => {
    if (!highlightTeam) return false;
    
    // Check if the cell contains the highlighted team
    if (typeof rowData[colKey] === 'string' && rowData[colKey] === highlightTeam) {
      return true;
    }
    
    // Check if the cell is an object that might contain team information
    if (typeof rowData[colKey] === 'object' && rowData[colKey]?.team === highlightTeam) {
      return true;
    }
    
    return false;
  };
  
  // Helper to check if a row is for a supported team
  const isSupportedTeam = (rowData, user) => {
    // If team column is present, check if it matches the user's supported team
    const teamCol = columns.find(col => col.key === 'team');
    if (teamCol && rowData[teamCol.key] && supportedTeams[user] === rowData[teamCol.key]) {
      return true;
    }
    
    return false;
  };
  
  // Helper to render cell content based on type
  const renderCellContent = (rowData, column) => {
    const value = rowData[column.key];
    
    // Handle undefined or null values
    if (value === undefined || value === null) {
      return '-';
    }
    
    // Handle team names with logos
    if (column.key === 'team' && typeof value === 'string') {
      return (
        <div className="team-name-with-logo">
          <TeamLogo team={value} logoUrl={teamLogos[value]} />
          <span>{value}</span>
        </div>
      );
    }
    
    // Handle user with supported team
    if (column.key === 'user' && supportedTeams && supportedTeams[value]) {
      return (
        <div className="participant-with-team">
          <span className="participant-name">{value}</span>
          <div className="supported-team-icon">
            <TeamLogo team={supportedTeams[value]} logoUrl={teamLogos[supportedTeams[value]]} size="small" />
          </div>
        </div>
      );
    }
    
    // Handle percentage values
    if (typeof value === 'number' && column.format === 'percent') {
      return `${value.toFixed(1)}%`;
    }
    
    // Handle mini-bars
    if (column.format === 'minibar' && typeof value === 'number') {
      const barClass = column.barClass || 'top3-bar';
      return (
        <div className="mini-bar-container">
          <div 
            className={`mini-bar ${barClass}`} 
            style={{ width: `${value}%` }}
          ></div>
          <span className="mini-bar-text">{Math.round(value)}%</span>
        </div>
      );
    }
    
    // Handle normal numeric values
    if (typeof value === 'number' && column.format === 'number') {
      return value.toFixed(column.decimals || 0);
    }
    
    // Return default value
    return value;
  };
  
  // Render table view
  const renderTable = () => (
    <div className="table-wrapper">
      <table id={id}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            // Determine row class name
            let rowClass = "";
            if (rowClassName) {
              if (typeof rowClassName === 'function') {
                rowClass = rowClassName(row, rowIndex);
              } else if (typeof rowClassName === 'string') {
                rowClass = rowClassName;
              }
            }
            
            return (
              <tr key={rowIndex} className={rowClass}>
                {columns.map((column, colIndex) => {
                  // Determine if this cell should be highlighted
                  const isHighlighted = shouldHighlightCell(row, column.key);
                  // Check if cell is for a supported team
                  const isSupportedTeamCell = column.key === 'user' ? isSupportedTeam(row, row[column.key]) : false;
                  
                  const cellClassName = [
                    isHighlighted ? "team-highlight" : "",
                    isSupportedTeamCell ? "supported-team-cell" : "",
                    column.className || ""
                  ].filter(Boolean).join(" ");
                  
                  return (
                    <td key={colIndex} className={cellClassName}>
                      {renderCellContent(row, column)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  
  // Render card view for mobile
  const renderCards = () => (
    <div className="mobile-cards-view">
      {data.map((row, rowIndex) => {
        // Determine row class name
        let rowClass = "";
        if (rowClassName) {
          if (typeof rowClassName === 'function') {
            rowClass = rowClassName(row, rowIndex);
          } else if (typeof rowClassName === 'string') {
            rowClass = rowClassName;
          }
        }
        
        const isExpanded = expandedRows.includes(rowIndex);
        const positionColumn = columns.find(col => col.key === 'position' || col.key === 'rank');
        const userColumn = columns.find(col => col.key === 'user');
        const teamColumn = columns.find(col => col.key === 'team');
        
        const position = positionColumn ? row[positionColumn.key] : rowIndex + 1;
        const user = userColumn ? row[userColumn.key] : null;
        const team = teamColumn ? row[teamColumn.key] : null;
        
        // Choose a primary label for the card
        let primaryLabel = '';
        if (team) {
          primaryLabel = team;
        } else if (user) {
          primaryLabel = user;
        }
        
        return (
          <div 
            key={rowIndex} 
            className={`mobile-data-card ${rowClass} ${isExpanded ? 'expanded' : ''}`}
            onClick={() => toggleRowExpanded(rowIndex)}
          >
            <div className="card-header">
              <div className="card-position">{position}</div>
              <div className="card-primary-content">
                {team && (
                  <div className="team-name-with-logo">
                    <TeamLogo team={team} logoUrl={teamLogos[team]} />
                    <span>{team}</span>
                  </div>
                )}
                {!team && user && supportedTeams && supportedTeams[user] && (
                  <div className="participant-with-team">
                    <span className="participant-name">{user}</span>
                    <div className="supported-team-icon">
                      <TeamLogo team={supportedTeams[user]} logoUrl={teamLogos[supportedTeams[user]]} size="small" />
                    </div>
                  </div>
                )}
                {!team && !user && primaryLabel && (
                  <div className="primary-label">{primaryLabel}</div>
                )}
              </div>
              <div className="expand-icon">{isExpanded ? '▼' : '▶'}</div>
            </div>
            
            {isExpanded && (
              <div className="card-details">
                {columns.map((column, colIndex) => {
                  // Skip columns already shown in header
                  if (column.key === 'position' || column.key === 'rank' || 
                      (column.key === 'team' && team) || 
                      (column.key === 'user' && user)) {
                    return null;
                  }
                  
                  return (
                    <div key={colIndex} className="detail-row">
                      <div className="detail-label">{column.label}</div>
                      <div className="detail-value">
                        {renderCellContent(row, column)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  
  return (
    <section className="section" id={id ? `${id}-section` : undefined}>
      {title && <h2 className="section-title">{title}</h2>}
      {description && <p className="section-description">{description}</p>}
      
      <div className="display-toggle-container">
        <button 
          className={`display-toggle ${displayMode === 'table' ? 'active' : ''}`}
          onClick={() => setDisplayMode('table')}
        >
          Table View
        </button>
        <button 
          className={`display-toggle ${displayMode === 'cards' ? 'active' : ''}`}
          onClick={() => setDisplayMode('cards')}
        >
          Card View
        </button>
      </div>
      
      {displayMode === 'table' ? renderTable() : renderCards()}
    </section>
  );
};

export default MobileOptimizedTable;