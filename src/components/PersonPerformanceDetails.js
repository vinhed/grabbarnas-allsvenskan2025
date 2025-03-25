// src/components/PersonPerformanceDetails.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

const PersonPerformanceDetails = ({ person, predictions, currentStandings, teamLogos, onClose }) => {
  const [teamDetails, setTeamDetails] = useState([]);
  const [metrics, setMetrics] = useState({
    averageRating: 0,
    averageDifference: 0,
    totalRating: 0,
    accuracy: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: 'difference', direction: 'asc' });
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState([]);
  
  useEffect(() => {
    if (!predictions || !currentStandings || currentStandings.length === 0) {
      return;
    }
    
    // Calculate performance details for each team
    calculateTeamDetails();
    
    // Check if on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [predictions, currentStandings]);
  
  const calculateTeamDetails = () => {
    let totalScore = 0;
    const details = [];
    
    for (let i = 0; i < predictions.length; i++) {
      const team = predictions[i];
      const predictedPosition = i + 1;
      
      // Find the actual position in standings
      const actualPosition = currentStandings.indexOf(team) + 1;
      
      if (actualPosition > 0) {
        const positionDifference = Math.abs(predictedPosition - actualPosition);
        totalScore += positionDifference;
        
        details.push({
          team,
          predictedPosition,
          actualPosition,
          difference: positionDifference
        });
      }
    }
    
    // Calculate the final score (240 - total score)
    const finalScore = 240 - totalScore;
    
    // Update team details with display values
    details.forEach(detail => {
      detail.rating = detail.difference;
      detail.ratingPercentage = ((240 - detail.difference) / 240 * 100).toFixed(1); // For visual display
    });
    
    // Calculate summary metrics
    const teamsMatched = details.length;
    const averageDifference = teamsMatched > 0 ? (totalScore / teamsMatched).toFixed(2) : 0;
    
    // Calculate accuracy as a percentage
    const maxPossibleDifference = details.length * details.length / 2;
    const accuracy = teamsMatched > 0 
      ? (100 - (totalScore / maxPossibleDifference * 100)).toFixed(1)
      : 0;
    
    setMetrics({
      averageRating: finalScore.toFixed(0),
      averageDifference,
      totalRating: finalScore,
      accuracy
    });
    
    // Sort the details based on current sort config
    setTeamDetails(sortData(details, sortConfig));
  };
  
  // Sort data based on column and direction
  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[config.key] < b[config.key]) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (a[config.key] > b[config.key]) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Handle column header click for sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    setTeamDetails(sortData(teamDetails, { key, direction }));
  };
  
  // Helper to render sort indicator
  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    
    return (
      <span className="sort-indicator">
        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
      </span>
    );
  };
  
  // Toggle team expansion for mobile view
  const toggleTeamExpansion = (teamIndex) => {
    if (expandedTeams.includes(teamIndex)) {
      setExpandedTeams(expandedTeams.filter(i => i !== teamIndex));
    } else {
      setExpandedTeams([...expandedTeams, teamIndex]);
    }
  };
  
  // Render mobile team cards
  const renderMobileTeamCards = () => {
    return (
      <div className="mobile-team-cards">
        {teamDetails.map((detail, index) => {
          // Determine rating class based on difference
          let ratingClass = '';
          if (detail.difference === 0) ratingClass = 'excellent-rating';
          else if (detail.difference <= 1) ratingClass = 'good-rating';
          else if (detail.difference <= 3) ratingClass = 'decent-rating';
          else if (detail.difference >= 5) ratingClass = 'poor-rating';
          
          const isExpanded = expandedTeams.includes(index);
          
          return (
            <div 
              key={`${detail.team}-${index}`} 
              className={`mobile-team-card ${ratingClass}`}
              onClick={() => toggleTeamExpansion(index)}
            >
              <div className="mobile-card-header">
                <div className="team-name-with-logo">
                  <TeamLogo team={detail.team} logoUrl={teamLogos[detail.team]} size="small" />
                  <span>{detail.team}</span>
                </div>
                <div className="difference-badge">
                  {detail.difference === 0 ? 'Perfect!' : `Diff: ${detail.difference}`}
                </div>
                <div className="expand-arrow">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>
              
              {isExpanded && (
                <div className="mobile-card-details">
                  <div className="detail-row">
                    <div className="detail-label">Predicted</div>
                    <div className="detail-value">{detail.predictedPosition}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Actual</div>
                    <div className="detail-value">{detail.actualPosition}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Difference</div>
                    <div className="detail-value">{detail.difference}</div>
                  </div>
                  <div className="rating-bar-container-mobile">
                    <div 
                      className="rating-bar" 
                      style={{ width: `${detail.ratingPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render desktop table
  const renderDesktopTable = () => {
    return (
      <div className="team-details-table-wrapper">
        <table className="team-details-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('team')} className="sortable-header">
                Team {renderSortIndicator('team')}
              </th>
              <th onClick={() => handleSort('predictedPosition')} className="sortable-header">
                Predicted {renderSortIndicator('predictedPosition')}
              </th>
              <th onClick={() => handleSort('actualPosition')} className="sortable-header">
                Actual {renderSortIndicator('actualPosition')}
              </th>
              <th onClick={() => handleSort('difference')} className="sortable-header">
                Difference {renderSortIndicator('difference')}
              </th>
            </tr>
          </thead>
          <tbody>
            {teamDetails.map((detail, index) => {
              // Determine rating quality for visual indication based on difference
              let ratingClass = '';
              if (detail.difference === 0) ratingClass = 'excellent-rating';
              else if (detail.difference <= 1) ratingClass = 'good-rating';
              else if (detail.difference <= 3) ratingClass = 'decent-rating';
              else if (detail.difference >= 5) ratingClass = 'poor-rating';
              
              return (
                <tr key={detail.team + index}>
                  <td>
                    <div className="team-name-with-logo">
                      <TeamLogo team={detail.team} logoUrl={teamLogos[detail.team]} />
                      <span>{detail.team}</span>
                    </div>
                  </td>
                  <td>{detail.predictedPosition}</td>
                  <td>{detail.actualPosition}</td>
                  <td className={detail.difference === 0 ? 'perfect-match' : ''}>
                    {detail.difference === 0 ? 'Perfect!' : detail.difference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render mobile-friendly metrics
  const renderMetricsCards = () => {
    return (
      <div className={`performance-metrics ${isMobile ? 'mobile-metrics' : ''}`}>
        <div className="metric-card">
          <div className="metric-value">{metrics.averageRating}</div>
          <div className="metric-label">Overall Score</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.accuracy}%</div>
          <div className="metric-label">Accuracy</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{metrics.averageDifference}</div>
          <div className="metric-label">Avg. Difference</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="person-performance-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{person}'s Prediction Performance</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {renderMetricsCards()}
        
        {/* View mode toggle for sorting on mobile */}
        {isMobile && (
          <div className="mobile-sort-options">
            <div className="sort-label">Sort by:</div>
            <button 
              className={`sort-button ${sortConfig.key === 'team' ? 'active' : ''}`}
              onClick={() => handleSort('team')}
            >
              Team {sortConfig.key === 'team' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button 
              className={`sort-button ${sortConfig.key === 'difference' ? 'active' : ''}`}
              onClick={() => handleSort('difference')}
            >
              Difference {sortConfig.key === 'difference' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        )}
        
        {/* Render appropriate view based on screen size */}
        {isMobile ? renderMobileTeamCards() : renderDesktopTable()}
        
      </div>
    </div>
  );
};

export default PersonPerformanceDetails;