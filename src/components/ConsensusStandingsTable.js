// src/components/ConsensusStandingsTable.js
import React, { useState } from 'react';
import TeamLogo from './TeamLogo';

const ConsensusStandingsTable = ({ consensusRankings, bets, teamLogos }) => {
  const [hoveredTeam, setHoveredTeam] = useState(null);

  // Calculate additional statistics for each team
  const calculateTeamStats = () => {
    const teamStats = {};
    
    for (const team of Object.keys(consensusRankings)) {
      const positions = [];
      
      // Collect all positions where this team was placed
      for (const [user, predictions] of Object.entries(bets)) {
        if (predictions.includes(team)) {
          const pos = predictions.indexOf(team) + 1; // Convert to 1-based position
          positions.push(pos);
        }
      }
      
      // Calculate statistics if we have positions
      if (positions.length > 0) {
        const avgPos = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
        const highestPos = Math.min(...positions);
        const lowestPos = Math.max(...positions);
        
        // Sort positions for median
        const sortedPositions = [...positions].sort((a, b) => a - b);
        const medianPos = sortedPositions.length % 2 !== 0
          ? sortedPositions[Math.floor(sortedPositions.length / 2)]
          : (sortedPositions[sortedPositions.length / 2 - 1] + sortedPositions[sortedPositions.length / 2]) / 2;
        
        // Calculate how many users predicted this team for each position group
        const teamCount = Object.keys(consensusRankings).length;
        
        const top3 = positions.filter(p => p <= 3).length;
        const top3Pct = (top3 / positions.length) * 100;
        
        const europa = positions.filter(p => p === 1).length;
        const europaPct = (europa / positions.length) * 100;
        
        const conference = positions.filter(p => p === 2 || p === 3).length;
        const conferencePct = (conference / positions.length) * 100;
        
        const relegation = positions.filter(p => p >= teamCount - 2).length;
        const relegationPct = (relegation / positions.length) * 100;
        
        teamStats[team] = {
          consensusPos: Object.keys(consensusRankings).indexOf(team) + 1,
          avgPos,
          highestPos,
          lowestPos,
          medianPos,
          top3Pct,
          europaPct,
          conferencePct,
          relegationPct,
          predictionsCount: positions.length,
          value: consensusRankings[team]
        };
      }
    }
    
    return teamStats;
  };

  const teamStats = calculateTeamStats();
  const teamCount = Object.keys(consensusRankings).length;

  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">📊</span> Consensus Rankings & Team Statistics</h2>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color legend-europaleague"></div>
          <span>Europa League (1st Place)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-conference"></div>
          <span>Conference League (2nd-3rd Place)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-direct"></div>
          <span>Direct Relegation (Bottom 2)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-playoff"></div>
          <span>Relegation Playoff (14th Place)</span>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table id="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Avg. Position</th>
              <th>Highest Rank</th>
              <th>Lowest Rank</th>
              <th>Top 3</th>
              <th>Relegation</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(consensusRankings).map(([team, value], index) => {
              if (!teamStats[team]) return null;
              
              const stats = teamStats[team];
              let rowClass = "";
              
              // Add classes for relegation and European qualification
              if (index === 0) {
                rowClass = "europaleague";
              } else if (index === 1 || index === 2) {
                rowClass = "conference-league";
              } else if (index >= teamCount - 2) {
                rowClass = "relegation-direct";
              } else if (index === teamCount - 3) {
                rowClass = "relegation-playoff";
              }
              
              
              return (
                <tr 
                  key={team} 
                  className={rowClass}
                  onMouseEnter={() => setHoveredTeam(team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  <td>{index + 1}</td>
                  <td>
                    <div className="team-name-with-logo">
                      <TeamLogo team={team} logoUrl={teamLogos[team]} />
                      <span>{team}</span>
                    </div>
                  </td>
                  <td>{stats.avgPos.toFixed(1)}</td>
                  <td className="best-rank">{stats.highestPos}</td>
                  <td className="worst-rank">{stats.lowestPos}</td>
                  <td>
                    <div className="mini-bar-container">
                      <div 
                        className="mini-bar top3-bar" 
                        style={{ width: `${stats.top3Pct}%` }}
                      ></div>
                      <span className="mini-bar-text">{Math.round(stats.top3Pct)}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="mini-bar-container">
                      <div 
                        className="mini-bar relegation-bar" 
                        style={{ width: `${stats.relegationPct}%` }}
                      ></div>
                      <span className="mini-bar-text">{Math.round(stats.relegationPct)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ConsensusStandingsTable;