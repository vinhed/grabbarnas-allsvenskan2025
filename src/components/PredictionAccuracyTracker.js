// src/components/PredictionAccuracyTracker.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PredictionAccuracyTracker = ({ bets, currentStandings }) => {
  const [accuracyData, setAccuracyData] = useState([]);
  const [overallAccuracy, setOverallAccuracy] = useState({});
  
  useEffect(() => {
    if (!bets || Object.keys(bets).length === 0 || !currentStandings || currentStandings.length === 0) {
      return;
    }
    
    calculateAccuracyData();
  }, [bets, currentStandings]);
  
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
  
  if (!bets || Object.keys(bets).length === 0 || !currentStandings || currentStandings.length === 0) {
    return (
      <section className="section">
        <h2 className="section-title"><span className="icon">📏</span> Prediction Accuracy</h2>
        <p>Accuracy tracking will be available once the season begins.</p>
      </section>
    );
  }
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">📏</span> Prediction Accuracy</h2>
      
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
              {overallAccuracy.highest ? overallAccuracy.highest.user : 'N/A'}
            </div>
            <div className="accuracy-card-stat">
              {overallAccuracy.highest ? `${overallAccuracy.highest.accuracyPercentage}%` : ''}
            </div>
          </div>
          
          <div className="accuracy-card worst">
            <div className="accuracy-card-title">Least Accurate</div>
            <div className="accuracy-card-value">
              {overallAccuracy.lowest ? overallAccuracy.lowest.user : 'N/A'}
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
              <tr key={item.user}>
                <td>{index + 1}</td>
                <td>{item.user}</td>
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
    </section>
  );
};

export default PredictionAccuracyTracker;