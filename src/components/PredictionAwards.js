// src/components/PredictionAwards.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';
import './PredictionAwards.css';

const PredictionAwards = ({ bets, currentStandings, teamLogos, isMobile }) => {
  const [awards, setAwards] = useState({
    consensusVsReality: [],
    mostSurprising: null,
    mostPredictable: null,
    contrarian: null,
    likelyLeaders: []
  });
  
  useEffect(() => {
    if (!bets || Object.keys(bets).length === 0 || !currentStandings || currentStandings.length === 0) {
      return;
    }
    
    calculateAwards();
  }, [bets, currentStandings]);
  
  const calculateAwards = () => {
    // Get the consensus ranking by averaging each team's predicted position
    const consensusRankings = calculateConsensusRankings(bets);
    
    // Calculate the difference between consensus and reality for each team
    const teamDifferences = calculateTeamDifferences(consensusRankings, currentStandings);
    
    // Find most surprising team (biggest difference between consensus and reality)
    const mostSurprisingTeam = findMostSurprisingTeam(teamDifferences);
    
    // Find most predictable team (smallest difference between consensus and reality)
    const mostPredictableTeam = findMostPredictableTeam(teamDifferences);
    
    // Find contrarian award (person who correctly predicted an unlikely leader)
    const contrarianAward = findContrarianAward(bets, currentStandings, consensusRankings);
    
    // Find predicted likely leaders (teams consistently predicted in top positions)
    const likelyLeaders = findLikelyLeaders(consensusRankings);
    
    // Top 3 consensus vs reality differences for quick overview
    const consensusVsReality = teamDifferences
      .sort((a, b) => b.difference - a.difference)
      .slice(0, 3);
    
    setAwards({
      consensusVsReality,
      mostSurprising: mostSurprisingTeam,
      mostPredictable: mostPredictableTeam,
      contrarian: contrarianAward,
      likelyLeaders
    });
  };
  
  // Calculate consensus rankings by averaging each team's predicted positions
  const calculateConsensusRankings = (predictions) => {
    const teamPositions = {};
    const teamCounts = {};
    
    // Sum up all predicted positions for each team
    Object.values(predictions).forEach(prediction => {
      if (!Array.isArray(prediction)) return;
      
      prediction.forEach((team, index) => {
        const position = index + 1;
        
        if (!teamPositions[team]) {
          teamPositions[team] = 0;
          teamCounts[team] = 0;
        }
        
        teamPositions[team] += position;
        teamCounts[team]++;
      });
    });
    
    // Calculate average position for each team
    const averagePositions = Object.keys(teamPositions).map(team => ({
      team,
      avgPosition: teamPositions[team] / teamCounts[team]
    }));
    
    // Sort by average position
    return averagePositions.sort((a, b) => a.avgPosition - b.avgPosition);
  };
  
  // Calculate difference between consensus rankings and current standings
  const calculateTeamDifferences = (consensusRankings, actualStandings) => {
    return consensusRankings.map(item => {
      const actualPosition = actualStandings.indexOf(item.team) + 1;
      const consensusPosition = consensusRankings.findIndex(r => r.team === item.team) + 1;
      
      return {
        team: item.team,
        consensusPosition,
        actualPosition,
        difference: Math.abs(consensusPosition - actualPosition),
        // Direction helps determine if team is doing better/worse than expected
        direction: actualPosition < consensusPosition ? 'better' : 
                  actualPosition > consensusPosition ? 'worse' : 'same'
      };
    });
  };
  
  // Find team with biggest difference between consensus and reality
  const findMostSurprisingTeam = (teamDifferences) => {
    if (!teamDifferences.length) return null;
    
    return teamDifferences.reduce((most, current) => {
      return current.difference > most.difference ? current : most;
    }, teamDifferences[0]);
  };
  
  // Find team with smallest difference between consensus and reality
  const findMostPredictableTeam = (teamDifferences) => {
    if (!teamDifferences.length) return null;
    
    return teamDifferences.reduce((most, current) => {
      return current.difference < most.difference ? current : most;
    }, teamDifferences[0]);
  };
  
  // Find person who correctly predicted an unlikely leader (contrarian award)
  const findContrarianAward = (predictions, actualStandings, consensusRankings) => {
    if (!actualStandings.length || !consensusRankings.length) return null;
    
    // Check top 3 actual teams to find unlikely leaders
    const topTeams = actualStandings.slice(0, 3);
    let contrarianResult = null;
    let highestConsensusRank = 0;
    
    // For each top performing team, see if it was ranked low in consensus but high by someone
    topTeams.forEach(team => {
      // Find where team was in consensus rankings
      const consensusPosition = consensusRankings.findIndex(item => item.team === team) + 1;
      
      // Only consider teams ranked outside top 5 in consensus (unlikely leaders)
      if (consensusPosition > 5) {
        // Find who predicted this team highly
        Object.entries(predictions).forEach(([person, prediction]) => {
          if (!Array.isArray(prediction)) return;
          
          const personPredictedPosition = prediction.indexOf(team) + 1;
          
          // If they predicted this team in top 4 while consensus didn't
          if (personPredictedPosition <= 4 && consensusPosition > highestConsensusRank) {
            highestConsensusRank = consensusPosition;
            contrarianResult = {
              person,
              team,
              consensusPosition,
              predictedPosition: personPredictedPosition,
              actualPosition: actualStandings.indexOf(team) + 1
            };
          }
        });
      }
    });
    
    return contrarianResult;
  };
  
  // Find teams consistently predicted in top positions
  const findLikelyLeaders = (consensusRankings) => {
    if (!consensusRankings.length) return [];
    
    // Get top 3 teams by consensus
    return consensusRankings
      .slice(0, 3)
      .map((item, index) => ({
        ...item,
        consensusPosition: index + 1
      }));
  };
  
  // Render award cards
  const renderAwardCards = () => {
    return (
      <div className="awards-grid">
        {/* Group Consensus vs Reality */}
        <div className="award-card consensus-reality">
          <h3 className="award-title">
            <span className="award-icon">🔍</span> Group Consensus vs Reality
          </h3>
          <div className="award-content">
            {awards.consensusVsReality.length > 0 ? (
              <div className="consensus-list">
                {awards.consensusVsReality.map((item, index) => (
                  <div key={item.team} className="consensus-item">
                    <div className="team-wrapper">
                      <TeamLogo team={item.team} logoUrl={teamLogos[item.team]} />
                      <span className="team-name">{item.team}</span>
                    </div>
                    <div className="position-difference">
                      <div className={`expected pos-${item.direction}`}>
                        <span className="pos-label">Expected:</span> 
                        <span className="pos-value">{item.consensusPosition}</span>
                      </div>
                      <div className={`actual pos-${item.direction}`}>
                        <span className="pos-label">Actual:</span> 
                        <span className="pos-value">{item.actualPosition}</span>
                      </div>
                      <div className="difference-arrow">
                        {item.direction === 'better' ? '↑' : item.direction === 'worse' ? '↓' : '→'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Not enough data yet</div>
            )}
          </div>
        </div>
        
        {/* Most Surprising Team */}
        <div className="award-card surprising">
          <h3 className="award-title">
            <span className="award-icon">🎭</span> Most Surprising Team
          </h3>
          <div className="award-content">
            {awards.mostSurprising ? (
              <div className="surprise-team">
                <div className="team-highlight">
                  <TeamLogo team={awards.mostSurprising.team} logoUrl={teamLogos[awards.mostSurprising.team]} size="large" />
                  <h4>{awards.mostSurprising.team}</h4>
                </div>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">{awards.mostSurprising.consensusPosition}</span>
                    <span className="stat-label">Expected</span>
                  </div>
                  <div className="stat-arrow">{awards.mostSurprising.direction === 'better' ? '↑' : '↓'}</div>
                  <div className="stat">
                    <span className="stat-value">{awards.mostSurprising.actualPosition}</span>
                    <span className="stat-label">Actual</span>
                  </div>
                </div>
                <div className="difference-badge">
                  <span>Difference: {awards.mostSurprising.difference} places</span>
                </div>
              </div>
            ) : (
              <div className="no-data">Not enough data yet</div>
            )}
          </div>
        </div>
        
        {/* Most Predictable Team */}
        <div className="award-card predictable">
          <h3 className="award-title">
            <span className="award-icon">🎯</span> Most Predictable Team
          </h3>
          <div className="award-content">
            {awards.mostPredictable ? (
              <div className="predictable-team">
                <div className="team-highlight">
                  <TeamLogo team={awards.mostPredictable.team} logoUrl={teamLogos[awards.mostPredictable.team]} size="large" />
                  <h4>{awards.mostPredictable.team}</h4>
                </div>
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-value">{awards.mostPredictable.consensusPosition}</span>
                    <span className="stat-label">Expected</span>
                  </div>
                  <div className="stat-equals">=</div>
                  <div className="stat">
                    <span className="stat-value">{awards.mostPredictable.actualPosition}</span>
                    <span className="stat-label">Actual</span>
                  </div>
                </div>
                <div className="difference-badge small">
                  <span>Off by only {awards.mostPredictable.difference} {awards.mostPredictable.difference === 1 ? 'place' : 'places'}</span>
                </div>
              </div>
            ) : (
              <div className="no-data">Not enough data yet</div>
            )}
          </div>
        </div>
        
        {/* Contrarian Award */}
        <div className="award-card contrarian">
          <h3 className="award-title">
            <span className="award-icon">👑</span> Contrarian Award
          </h3>
          <div className="award-content">
            {awards.contrarian ? (
              <div className="contrarian-award">
                <div className="person-highlight">
                  <span className="person-name">{awards.contrarian.person}</span>
                </div>
                <div className="team-prediction">
                  <div className="predicted-team">
                    <TeamLogo team={awards.contrarian.team} logoUrl={teamLogos[awards.contrarian.team]} />
                    <span>{awards.contrarian.team}</span>
                  </div>
                  <div className="prediction-details">
                    <div className="prediction-stat">
                      <span className="label">Group expected:</span>
                      <span className="value pos-low">{awards.contrarian.consensusPosition}th</span>
                    </div>
                    <div className="prediction-stat">
                      <span className="label">{awards.contrarian.person} predicted:</span>
                      <span className="value pos-high">{awards.contrarian.predictedPosition}{ordinalSuffix(awards.contrarian.predictedPosition)}</span>
                    </div>
                    <div className="prediction-stat">
                      <span className="label">Actual position:</span>
                      <span className="value pos-high">{awards.contrarian.actualPosition}{ordinalSuffix(awards.contrarian.actualPosition)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No contrarian winners yet</div>
            )}
          </div>
        </div>
        
        {/* Predicted Likely Leaders */}
        <div className="award-card likely-leaders">
          <h3 className="award-title">
            <span className="award-icon">⭐</span> Group's Predicted Leaders
          </h3>
          <div className="award-content">
            {awards.likelyLeaders.length > 0 ? (
              <div className="leaders-list">
                {awards.likelyLeaders.map((item, index) => (
                  <div key={item.team} className={`leader-item rank-${index + 1}`}>
                    <div className="rank-badge">{index + 1}</div>
                    <div className="team-wrapper">
                      <TeamLogo team={item.team} logoUrl={teamLogos[item.team]} />
                      <span className="team-name">{item.team}</span>
                    </div>
                    <div className="avg-position">
                      <span className="avg-label">Avg Prediction:</span>
                      <span className="avg-value">{item.avgPosition.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Not enough data yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function for ordinal suffixes (1st, 2nd, 3rd, etc.)
  const ordinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    
    return 'th';
  };
  
  return (
    <section className="section prediction-awards-section">
      <h2 className="section-title">
        <span className="icon">🏅</span> Special Recognition Awards
      </h2>
      {renderAwardCards()}
    </section>
  );
};

export default PredictionAwards;