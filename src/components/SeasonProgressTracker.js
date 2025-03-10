// src/components/SeasonProgressTracker.js
import React from 'react';

const SeasonProgressTracker = ({ apiData }) => {
  // Extract season stats from API data
  const getSeasonStats = () => {
    if (!apiData) return null;
    
    let totalMatches = 0;
    let playedMatches = 0;
    let totalTeams = 0;
    
    // Check if we have any real data
    let hasData = false;
    
    for (const key in apiData) {
      if (key === 'undefined' || !key.match(/^\d+$/)) continue;
      
      const teamInfo = apiData[key];
      if (teamInfo.stats) {
        hasData = true;
        totalTeams++;
        
        for (const stat of teamInfo.stats) {
          if (stat.name === 'gp' && stat.value) {
            playedMatches += parseInt(stat.value, 10);
          }
        }
      }
    }
    
    if (!hasData) return null;
    
    // Calculate total matches in a season (each team plays against every other team twice)
    if (totalTeams > 0) {
      totalMatches = totalTeams * (totalTeams - 1);
      // Adjust for double-counted matches (each match is counted for two teams)
      playedMatches = playedMatches / 2;
    }
    
    // Calculate season progress percentage
    const progressPct = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;
    
    // Calculate rounds (using Swedish Allsvenskan format with 30 rounds for 16 teams)
    const totalRounds = (totalTeams - 1) * 2;
    const completedRounds = Math.floor((playedMatches / (totalTeams / 2)));
    
    return {
      totalMatches,
      playedMatches: Math.round(playedMatches),
      remainingMatches: Math.round(totalMatches - playedMatches),
      progressPct,
      totalRounds,
      completedRounds,
      totalTeams
    };
  };
  
  const seasonStats = getSeasonStats();
  
  if (!seasonStats) {
    return null;
  }
  
  // Calculate season stage description
  const getSeasonStage = (progressPct) => {
    if (progressPct === 0) return "Pre-season";
    if (progressPct < 25) return "Early season";
    if (progressPct < 50) return "Mid-season";
    if (progressPct < 75) return "Late season";
    if (progressPct < 100) return "Season finale";
    return "Season completed";
  };
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">📅</span> Season Progress</h2>
      <p className="section-description">Current progress of the Allsvenskan 2025 season</p>
      
      <div className="season-stats-grid">
        <div className="season-progress-container">
          <div className="season-progress-header">
            <span className="season-stage">{getSeasonStage(seasonStats.progressPct)}</span>
            <span className="progress-percentage">{seasonStats.progressPct}% Complete</span>
          </div>
          
          <div className="season-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${seasonStats.progressPct}%` }}
            ></div>
          </div>
          
          <div className="season-details-grid">
            <div className="season-detail-item">
              <div className="detail-value">{seasonStats.completedRounds} / {seasonStats.totalRounds}</div>
              <div className="detail-label">Rounds</div>
            </div>
            
            <div className="season-detail-item">
              <div className="detail-value">{seasonStats.playedMatches} / {seasonStats.totalMatches}</div>
              <div className="detail-label">Matches</div>
            </div>
            
            <div className="season-detail-item">
              <div className="detail-value">{seasonStats.remainingMatches}</div>
              <div className="detail-label">Matches Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonProgressTracker;