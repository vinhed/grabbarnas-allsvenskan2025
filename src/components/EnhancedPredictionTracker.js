// src/components/EnhancedPredictionTracker.js
import React, { useState, useEffect } from 'react';
import { calculatePredictionScores, getLeaderboard } from '../api/allsvenskanApi';
import TeamLogo from './TeamLogo';

const EnhancedPredictionTracker = ({ currentStandings, bets, supportedTeams, teamLogos, apiData }) => {
  const [scores, setScores] = useState([]);
  const [accuracyData, setAccuracyData] = useState([]);
  const [overallAccuracy, setOverallAccuracy] = useState({});
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    if (!bets || Object.keys(bets).length === 0 || !currentStandings || currentStandings.length === 0) {
      return;
    }
    
    // Calculate scores and leaderboard
    const calculatedScores = calculatePredictionScores(bets, currentStandings);
    const leaderboard = getLeaderboard(calculatedScores);
    setScores(leaderboard);
    
    // Calculate accuracy data
    calculateAccuracyData();
  }, [bets, currentStandings]);
  
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
  
  const calculateAccuracyData = () => {
    // Convert current standings into a map for easy lookup
    const currentPositions = {};
    currentStandings.forEach((team, index) => {
      currentPositions[team] = index + 1;
    });
    
    // Calculate accuracy for each participant
    const accuracyByUser = {};
    const userBestPredictions = {};
    const userWorstPredictions = {};
    
    for (const [user, predictions] of Object.entries(bets)) {
      let totalPositionDiff = 0;
      let predictionCount = 0;
      let bestPredictionDiff = Number.MAX_SAFE_INTEGER;
      let worstPredictionDiff = 0;
      let bestPredictionTeam = '';
      let worstPredictionTeam = '';
      
      for (let i = 0; i < predictions.length; i++) {
        const team = predictions[i];
        const predictedPosition = i + 1;
        
        if (currentPositions[team] !== undefined) {
          const actualPosition = currentPositions[team];
          const positionDiff = Math.abs(predictedPosition - actualPosition);
          
          totalPositionDiff += positionDiff;
          predictionCount++;
          
          // Track best prediction (smallest difference)
          if (positionDiff < bestPredictionDiff) {
            bestPredictionDiff = positionDiff;
            bestPredictionTeam = team;
          }
          
          // Track worst prediction (largest difference)
          if (positionDiff > worstPredictionDiff) {
            worstPredictionDiff = positionDiff;
            worstPredictionTeam = team;
          }
        }
      }
      
      if (predictionCount > 0) {
        // Calculate average position difference
        const avgPositionDiff = totalPositionDiff / predictionCount;
        
        // Calculate accuracy percentage (100% = perfect prediction, 0% = worst possible)
        const maxPossibleDiff = predictions.length - 1; // Maximum possible position difference
        const accuracyPercentage = Math.max(0, 100 - (avgPositionDiff / maxPossibleDiff * 100));
        
        accuracyByUser[user] = {
          user,
          avgPositionDiff: parseFloat(avgPositionDiff.toFixed(2)),
          accuracyPercentage: parseFloat(accuracyPercentage.toFixed(2)),
          predictionCount
        };
        
        userBestPredictions[user] = {
          team: bestPredictionTeam,
          difference: bestPredictionDiff
        };
        
        userWorstPredictions[user] = {
          team: worstPredictionTeam,
          difference: worstPredictionDiff
        };
      }
    }
    
    // Sort users by accuracy (highest first)
    const sortedAccuracy = Object.values(accuracyByUser).sort(
      (a, b) => b.accuracyPercentage - a.accuracyPercentage
    );
    
    // Calculate overall stats
    const avgAccuracy = sortedAccuracy.reduce((sum, item) => sum + item.accuracyPercentage, 0) / sortedAccuracy.length;
    
    setAccuracyData(sortedAccuracy);
    setOverallAccuracy({
      average: parseFloat(avgAccuracy.toFixed(2)),
      highest: sortedAccuracy.length > 0 ? sortedAccuracy[0] : null,
      lowest: sortedAccuracy.length > 0 ? sortedAccuracy[sortedAccuracy.length - 1] : null,
      bestPredictions: userBestPredictions,
      worstPredictions: userWorstPredictions
    });
  };
  
  // Function to render participant name with supported team logo
  const renderParticipantWithTeam = (username) => {
    const supportedTeam = supportedTeams[username];
    
    return (
      <div className="participant-with-team">
        <span className="participant-name">{username}</span>
        {supportedTeam && teamLogos[supportedTeam] && (
          <div className="supported-team-icon">
            <TeamLogo team={supportedTeam} logoUrl={teamLogos[supportedTeam]} size="small" />
          </div>
        )}
      </div>
    );
  };
  
  if (!bets || Object.keys(bets).length === 0 || !currentStandings || currentStandings.length === 0 || !hasMatchesPlayed()) {
    return null;
  }
  
  return (
    <section className="section" id="prediction-performance-section">
      <h2 className="section-title"><span className="icon">🏆</span> Prediction Performance</h2>
      
      {/* Tabs for switching between views */}
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Current Scores
        </button>
        <button 
          className={`tab-button ${activeTab === 'accuracy' ? 'active' : ''}`}
          onClick={() => setActiveTab('accuracy')}
        >
          Prediction Accuracy
        </button>
        <button 
          className={`tab-button ${activeTab === 'combined' ? 'active' : ''}`}
          onClick={() => setActiveTab('combined')}
        >
          Combined View
        </button>
      </div>
      
      {/* Leaderboard View */}
      {activeTab === 'leaderboard' && (
        <div className="tab-content">
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
                {scores.map((entry, index) => {
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
                      <td>{renderParticipantWithTeam(entry.user)}</td>
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
        </div>
      )}
      
      {/* Accuracy View */}
      {activeTab === 'accuracy' && (
        <div className="tab-content">
          {/* Overall accuracy overview */}
          <div className="accuracy-overview">
            <div className="accuracy-meter">
              <div className="accuracy-label">Group Accuracy</div>
              <div className="accuracy-value">{overallAccuracy.average}%</div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${overallAccuracy.average}%` }}></div>
              </div>
            </div>
            
            <div className="accuracy-highlights">
              <div className="accuracy-card best">
                <div className="accuracy-card-title">Most Accurate</div>
                <div className="accuracy-card-value">
                  {overallAccuracy.highest ? renderParticipantWithTeam(overallAccuracy.highest.user) : 'N/A'}
                </div>
                <div className="accuracy-card-stat">
                  {overallAccuracy.highest ? `${overallAccuracy.highest.accuracyPercentage}%` : ''}
                </div>
              </div>
              
              <div className="accuracy-card worst">
                <div className="accuracy-card-title">Least Accurate</div>
                <div className="accuracy-card-value">
                  {overallAccuracy.lowest ? renderParticipantWithTeam(overallAccuracy.lowest.user) : 'N/A'}
                </div>
                <div className="accuracy-card-stat">
                  {overallAccuracy.lowest ? `${overallAccuracy.lowest.accuracyPercentage}%` : ''}
                </div>
              </div>
            </div>
          </div>
          
          {/* Accuracy table */}
          <div className="table-wrapper">
            <table className="accuracy-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participant</th>
                  <th>Accuracy %</th>
                  <th>Avg. Position Diff</th>
                  <th>Best Prediction</th>
                  <th>Worst Prediction</th>
                </tr>
              </thead>
              <tbody>
                {accuracyData.map((item, index) => (
                  <tr key={item.user} className={index < 3 ? `medal-${index + 1}` : ""}>
                    <td>{index + 1}</td>
                    <td>{renderParticipantWithTeam(item.user)}</td>
                    <td>{item.accuracyPercentage}%</td>
                    <td>{item.avgPositionDiff}</td>
                    <td className="best-prediction">
                      {overallAccuracy.bestPredictions[item.user]?.team} 
                      {overallAccuracy.bestPredictions[item.user] ? 
                        ` (±${overallAccuracy.bestPredictions[item.user].difference})` : ''}
                    </td>
                    <td className="worst-prediction">
                      {overallAccuracy.worstPredictions[item.user]?.team}
                      {overallAccuracy.worstPredictions[item.user] ? 
                        ` (±${overallAccuracy.worstPredictions[item.user].difference})` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Combined View */}
      {activeTab === 'combined' && (
        <div className="tab-content">
          <div className="table-wrapper">
            <table className="combined-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participant</th>
                  <th>Score</th>
                  <th>Score %</th>
                  <th>Accuracy %</th>
                  <th>Avg. Position Diff</th>
                  <th>Performance Index</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((scoreEntry, index) => {
                  // Find matching accuracy data
                  const accuracyEntry = accuracyData.find(item => item.user === scoreEntry.user) || {
                    accuracyPercentage: 0,
                    avgPositionDiff: 0
                  };
                  
                  // Calculate combined performance index (average of score % and accuracy %)
                  const performanceIndex = ((scoreEntry.percent + accuracyEntry.accuracyPercentage) / 2).toFixed(1);
                  
                  // Sort by performance index
                  const position = index + 1;
                  const medalClass = position <= 3 ? `medal-${position}` : "";
                  
                  return (
                    <tr key={scoreEntry.user} className={medalClass}>
                      <td>{position}</td>
                      <td>{renderParticipantWithTeam(scoreEntry.user)}</td>
                      <td>{scoreEntry.score} pts</td>
                      <td>{scoreEntry.percent}%</td>
                      <td>{accuracyEntry.accuracyPercentage}%</td>
                      <td>{accuracyEntry.avgPositionDiff}</td>
                      <td className="performance-index">{performanceIndex}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="explanation-box">
            <h3>Performance Index Explained</h3>
            <p>
              The Performance Index combines both the points-based scoring system and prediction accuracy into a single metric.
              It's calculated as the average of Score % (based on points) and Accuracy % (based on position differences).
              This provides a comprehensive view of how well each participant's predictions match the current standings.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default EnhancedPredictionTracker;