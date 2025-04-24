// src/components/DetailedPredictionsModal.js
import React from 'react';
import TeamLogo from './TeamLogo';
import './DetailedPredictionsModal.css';

const DetailedPredictionsModal = ({ person, data, teamLogos, onClose }) => {
  if (!person || !data) return null;
  
  // Find the selected person's data
  const personData = data.find(p => p.person === person);
  if (!personData) return null;
  
  // Sort team details from best to worst prediction (smallest to largest difference)
  const sortedTeamDetails = [...personData.teamDetails].sort((a, b) => a.difference - b.difference);
  
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
        
        <div className="modal-content">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Predicted</th>
                <th>Actual</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeamDetails.map((detail) => {
                // Calculate a color gradient based on difference
                // Green for small differences, red for large ones
                const maxDifference = 16; // Max possible difference
                const colorIntensity = Math.min(detail.difference / maxDifference, 1);
                const colorClass = colorIntensity < 0.3 ? 'good' : 
                                  colorIntensity < 0.6 ? 'average' : 'poor';
                
                return (
                  <tr key={detail.team} className={`prediction-row ${colorClass}`}>
                    <td className="team-cell">
                      <div className="team-with-logo">
                        <TeamLogo team={detail.team} logoUrl={teamLogos[detail.team]} size="medium" />
                        <span>{detail.team}</span>
                      </div>
                    </td>
                    <td className="position-cell">{detail.predictedPosition}</td>
                    <td className="position-cell">{detail.actualPosition}</td>
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