// src/components/PredictionAccuracyTracker.js
import React, { useMemo } from 'react';

const PredictionAccuracyTracker = ({ bets, currentStandings }) => {
  // Calculate accuracy scores
  const accuracyData = useMemo(() => {
    // Return empty data if no standings
    if (!currentStandings || currentStandings.length === 0) {
      return {
        overallAccuracy: 0,
        userAccuracy: {},
        highestUser: '',
        highestAccuracy: 0,
        lowestUser: '',
        lowestAccuracy: 0
      };
    }
    // Create a map of current standings positions
    const standingsMap = {};
    currentStandings.forEach((team, index) => {
      standingsMap[team.name] = index + 1;
    });
    
    // Calculate accuracy for each user
    const userAccuracy = {};
    let totalAccuracy = 0;
    let userCount = 0;
    
    for (const [user, predictions] of Object.entries(bets)) {
      let totalDifference = 0;
      let teamsMatched = 0;
      
      // Calculate position difference for each predicted team
      predictions.forEach((team, predIndex) => {
        if (standingsMap[team]) {
          const actualPos = standingsMap[team];
          const predPos = predIndex + 1;
          const difference = Math.abs(actualPos - predPos);
          totalDifference += difference;
          teamsMatched++;
        }
      });
      
      // Calculate average difference (lower is better)
      if (teamsMatched > 0) {
        const averageDiff = totalDifference / teamsMatched;
        // Convert to percentage (100% - normalized diff)
        // Max possible diff would be number of teams - 1
        const maxDiff = Object.keys(standingsMap).length - 1;
        const accuracyPct = Math.max(0, 100 - (averageDiff / maxDiff * 100));
        
        userAccuracy[user] = {
          accuracyPct: Math.round(accuracyPct),
          averageDiff: Math.round(averageDiff * 10) / 10
        };
        
        totalAccuracy += accuracyPct;
        userCount++;
      }
    }
    
    // Calculate overall average accuracy
    const overallAccuracy = userCount > 0 ? Math.round(totalAccuracy / userCount) : 0;
    
    // Find highest and lowest accuracy users
    let highestUser = '';
    let highestAccuracy = 0;
    let lowestUser = '';
    let lowestAccuracy = 100;
    
    for (const [user, data] of Object.entries(userAccuracy)) {
      if (data.accuracyPct > highestAccuracy) {
        highestAccuracy = data.accuracyPct;
        highestUser = user;
      }
      if (data.accuracyPct < lowestAccuracy) {
        lowestAccuracy = data.accuracyPct;
        lowestUser = user;
      }
    }
    
    return {
      overallAccuracy,
      userAccuracy,
      highestUser,
      highestAccuracy,
      lowestUser,
      lowestAccuracy
    };
  }, [bets, currentStandings]);
  
  // Skip rendering if no current standings data available
  if (!currentStandings || currentStandings.length === 0) {
    return null;
  }
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">🎯</span> Prediction Accuracy</h2>
      <p className="section-description">How accurate are the predictions compared to current standings?</p>
      
      <div className="accuracy-overview">
        <div className="accuracy-meter">
          <div className="accuracy-label">Overall Group Accuracy</div>
          <div className="accuracy-value">{accuracyData.overallAccuracy}%</div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${accuracyData.overallAccuracy}%` }}
            ></div>
          </div>
        </div>
        
        <div className="accuracy-highlights">
          <div className="accuracy-card best">
            <div className="accuracy-card-title">Most Accurate</div>
            <div className="accuracy-card-value">{accuracyData.highestUser}</div>
            <div className="accuracy-card-stat">{accuracyData.highestAccuracy}%</div>
          </div>
          
          <div className="accuracy-card worst">
            <div className="accuracy-card-title">Least Accurate</div>
            <div className="accuracy-card-value">{accuracyData.lowestUser}</div>
            <div className="accuracy-card-stat">{accuracyData.lowestAccuracy}%</div>
          </div>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="accuracy-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Accuracy</th>
              <th>Avg Position Diff</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(accuracyData.userAccuracy)
              .sort(([, a], [, b]) => b.accuracyPct - a.accuracyPct)
              .map(([user, data]) => (
                <tr key={user}>
                  <td>{user}</td>
                  <td>
                    <div className="mini-bar-container">
                      <div 
                        className="mini-bar top3-bar" 
                        style={{ width: `${data.accuracyPct}%` }}
                      ></div>
                      <span className="mini-bar-text">{data.accuracyPct}%</span>
                    </div>
                  </td>
                  <td>{data.averageDiff} positions</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PredictionAccuracyTracker;