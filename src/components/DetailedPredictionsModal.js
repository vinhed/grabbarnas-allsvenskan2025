// src/components/DetailedPredictionsModal.js
import React from 'react';
import TeamLogo from './TeamLogo';
import './DetailedPredictionsModal.css';

const DetailedPredictionsModal = ({ person, data, teamLogos, onClose }) => {
  if (!person || !data) return null;
  
  // Find the selected person's data
  const personData = data.find(p => p.person === person);
  if (!personData) return null;
  
  // Sort team details by actual position
  const sortedTeamDetails = [...personData.teamDetails].sort((a, b) => a.actualPosition - b.actualPosition);

  // Handle click on the overlay to close the modal
  const handleOverlayClick = (e) => {
    // Only close if the click was directly on the overlay, not its children
    if (e.target.className === 'detailed-predictions-overlay') {
      onClose();
    }
  };
  
  return (
    <div className="detailed-predictions-overlay" onClick={handleOverlayClick}>
      <div className="detailed-predictions-modal">
        <div className="modal-header">
          <h3>{personData.person}'s Predictions</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-summary">
          <div className="summary-item">
            <div className="summary-label">Score</div>
            <div className="summary-value">{personData.averageRating}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Avg. Diff</div>
            <div className="summary-value">{personData.averageDifference}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Perfect</div>
            <div className="summary-value perfect-value">{personData.perfectPicks || 0}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Top 3</div>
            <div className="summary-value top3-value">{personData.top3Accuracy || '0'}%</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Relegation</div>
            <div className="summary-value relegation-value">{personData.relegationAccuracy || '0'}%</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Outlier Score</div>
            <div className="summary-value outlier-value">{personData.outlierPoints || 0}</div>
          </div>
        </div>
        
        <div className="modal-content">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>#</th>
                <th className={"align-left"}>Team</th>
                <th>Predicted</th>
                <th>Consensus</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeamDetails.map((detail) => {
                const colorClass = detail.difference <= 2 ? 'good' : detail.difference <= 5 ? 'average' : 'poor';
                
                // Check if it's a perfect pick
                const isPerfect = detail.difference === 0;
                
                // Check if it's an outlier prediction
                const isOutlier = detail.isOutlier;
                
                return (
                  <tr key={detail.team} className={`prediction-row ${colorClass} ${isOutlier ? 'outlier-row' : ''}`}>
                    <td className="position-cell">{detail.actualPosition}</td>
                    <td className="team-cell">
                      <div className="team-with-logo">
                        <TeamLogo team={detail.team} logoUrl={teamLogos[detail.team]} size="medium" />
                        <span>{detail.team}</span>
                        {isPerfect && <span className="perfect-indicator" title="Perfect Prediction">✓</span>}
                        {isOutlier && <span className="outlier-indicator" title="Outlier Prediction">★</span>}
                      </div>
                    </td>
                    <td className="position-cell">{detail.predictedPosition}</td>
                    <td className="position-cell">{detail.consensusPosition || '-'}</td>
                    <td className="difference-cell">
                      <span className={`difference-badge ${colorClass}`}>
                        {detail.difference}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailedPredictionsModal;