// src/components/TeamMomentumTracker.js
import React from 'react';
import TeamLogo from './TeamLogo';

const TeamMomentumTracker = ({ currentStandings, consensusRankings, teamLogos }) => {
  // Skip if no current standings
  if (!currentStandings || currentStandings.length === 0 || !consensusRankings) {
    return null;
  }

  // Calculate momentum (difference between current position and predicted position)
  const calculateMomentum = () => {
    const momentumData = [];
    
    // Create a map of consensus positions
    const consensusMap = {};
    Object.keys(consensusRankings).forEach((team, index) => {
      consensusMap[team] = index + 1;
    });
    
    // Calculate momentum for each team in current standings
    currentStandings.forEach((teamData, currentPos) => {
      const team = teamData.name;
      if (consensusMap[team]) {
        const predictedPos = consensusMap[team];
        const positionDiff = predictedPos - (currentPos + 1);
        
        // Positive means team is doing better than predicted (higher up the table)
        // Negative means team is doing worse than predicted (lower down the table)
        momentumData.push({
          team,
          currentPos: currentPos + 1,
          predictedPos,
          momentum: positionDiff,
          // Get form data if available
          form: teamData.form || []
        });
      }
    });
    
    // Sort by momentum (highest to lowest)
    return momentumData.sort((a, b) => b.momentum - a.momentum);
  };
  
  const momentumData = calculateMomentum();
  
  // Separate overperformers and underperformers
  const overperformers = momentumData.filter(team => team.momentum > 0);
  const underperformers = momentumData.filter(team => team.momentum < 0);
  const onTarget = momentumData.filter(team => team.momentum === 0);
  
  // Display only top 3 of each category
  const topOverperformers = overperformers.slice(0, 3);
  const topUnderperformers = underperformers.slice(0, 3).reverse(); // Show worst first
  
  // Helper function to render team momentum
  const renderTeamMomentum = (teamData) => {
    const directionClass = teamData.momentum > 0 ? 'positive-momentum' : 
                          teamData.momentum < 0 ? 'negative-momentum' : 'neutral-momentum';
    
    const directionIcon = teamData.momentum > 0 ? '↑' : 
                         teamData.momentum < 0 ? '↓' : '–';
    
    const momentumAbs = Math.abs(teamData.momentum);
    
    return (
      <div key={teamData.team} className={`team-momentum-item ${directionClass}`}>
        <div className="team-momentum-position">
          <span className="current-position">{teamData.currentPos}</span>
          <span className="direction-arrow">{directionIcon}</span>
          <span className="predicted-position">{teamData.predictedPos}</span>
        </div>
        
        <div className="team-details">
          <div className="team-name-with-logo">
            <TeamLogo team={teamData.team} logoUrl={teamLogos[teamData.team]} />
            <span>{teamData.team}</span>
          </div>
        </div>
        
        <div className="momentum-value">
          <span className="momentum-indicator">{momentumAbs} {momentumAbs === 1 ? 'position' : 'positions'}</span>
        </div>
      </div>
    );
  };
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">📈</span> Team Momentum</h2>
      <p className="section-description">Comparing current performance vs predictions</p>
      
      <div className="momentum-grid">
        <div className="momentum-column overperformers">
          <h3 className="momentum-column-title">
            <span className="momentum-icon positive">↑</span> Overperforming Teams
          </h3>
          <div className="momentum-teams-list">
            {topOverperformers.length > 0 ? (
              topOverperformers.map(renderTeamMomentum)
            ) : (
              <div className="no-momentum-data">No teams currently overperforming</div>
            )}
          </div>
        </div>
        
        <div className="momentum-column underperformers">
          <h3 className="momentum-column-title">
            <span className="momentum-icon negative">↓</span> Underperforming Teams
          </h3>
          <div className="momentum-teams-list">
            {topUnderperformers.length > 0 ? (
              topUnderperformers.map(renderTeamMomentum)
            ) : (
              <div className="no-momentum-data">No teams currently underperforming</div>
            )}
          </div>
        </div>
      </div>
      
      {onTarget.length > 0 && (
        <div className="on-target-teams">
          <h3 className="on-target-title">
            <span className="momentum-icon neutral">○</span> On Target
          </h3>
          <div className="on-target-list">
            {onTarget.map(team => (
              <div key={team.team} className="on-target-team">
                <TeamLogo team={team.team} logoUrl={teamLogos[team.team]} />
                <span>{team.team}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamMomentumTracker;