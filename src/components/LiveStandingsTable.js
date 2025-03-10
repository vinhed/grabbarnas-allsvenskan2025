// src/components/LiveStandingsTable.js
import React from 'react';
import { calculatePredictionScores, getLeaderboard } from '../api/allsvenskanApi';
import TeamLogo from './TeamLogo';

const LiveStandingsTable = ({ currentStandings, bets, apiData }) => {
  // Check if there are any matches played
  const hasMatchesPlayed = () => {
    if (!apiData) return false;
    
    for (const key in apiData) {
      if (key === 'undefined' || !key.match(/^\d+$/)) continue;
      
      const teamInfo = apiData[key];
      if (teamInfo.stats) {
        for (const stat of teamInfo.stats) {
          if (stat.name === 'gp' && stat.value > 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  if (!currentStandings || currentStandings.length === 0 || !hasMatchesPlayed()) {
    return null;
  }
  
  // Calculate scores based on current standings
  const scores = calculatePredictionScores(bets, currentStandings);
  const leaderboard = getLeaderboard(scores);
  
  return (
    <section className="section" id="current-leaderboard-section">
      <h2 className="section-title"><span className="icon">🏆</span> Current Prediction Scores</h2>
      <p className="section-description">Based on current standings. Higher scores are better!</p>
      
      <div className="table-wrapper">
        <table id="current-leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Participant</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Best Prediction</th>
              <th>Worst Prediction</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => {
              const position = index + 1;
              const medalClass = position <= 3 ? `medal-${position}` : "";
              
              // Format best and worst predictions
              let bestTeam = "N/A";
              let bestDetails = "";
              if (entry.bestPrediction) {
                const [team, details] = entry.bestPrediction;
                bestTeam = team;
                bestDetails = ` (P:${details.predicted}, A:${details.actual})`;
              }
              
              let worstTeam = "N/A";
              let worstDetails = "";
              if (entry.worstPrediction) {
                const [team, details] = entry.worstPrediction;
                worstTeam = team;
                worstDetails = ` (P:${details.predicted}, A:${details.actual})`;
              }
              
              return (
                <tr key={entry.user} className={medalClass}>
                  <td>{position}</td>
                  <td>{entry.user}</td>
                  <td>{entry.score} pts</td>
                  <td>{entry.percent}%</td>
                  <td className="best-prediction">{bestTeam}{bestDetails}</td>
                  <td className="worst-prediction">{worstTeam}{worstDetails}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LiveStandingsTable;