// src/components/UserHeadToHead.js
import React, { useState, useMemo } from 'react';
import TeamLogo from './TeamLogo';

const UserHeadToHead = ({ bets, teamLogos }) => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  
  const users = Object.keys(bets);
  
  // Calculate comparison data when users are selected
  const comparisonData = useMemo(() => {
    if (!user1 || !user2 || user1 === user2) return null;
    
    const user1Predictions = bets[user1] || [];
    const user2Predictions = bets[user2] || [];
    
    // Calculate similarity percentage
    let samePositionCount = 0;
    let totalCompared = 0;
    const differences = [];
    
    // Maximum number of teams to compare
    const maxTeams = Math.min(user1Predictions.length, user2Predictions.length);
    
    for (let i = 0; i < maxTeams; i++) {
      const team1 = user1Predictions[i];
      const team2 = user2Predictions[i];
      
      if (team1 === team2) {
        samePositionCount++;
      } else {
        // Find where user2 placed team1
        const team1PosForUser2 = user2Predictions.indexOf(team1);
        const posDifference = team1PosForUser2 !== -1 ? Math.abs(i - team1PosForUser2) : 0;
        
        differences.push({
          position: i + 1,
          user1Team: team1,
          user2Team: team2,
          posDifference: team1PosForUser2 !== -1 ? posDifference : '-'
        });
      }
      totalCompared++;
    }
    
    // Sort differences by largest position difference
    const sortedDifferences = differences.sort((a, b) => {
      // If posDifference is a string ('-'), it should come last
      if (a.posDifference === '-') return 1;
      if (b.posDifference === '-') return -1;
      return b.posDifference - a.posDifference;
    });
    
    // Calculate average position difference (exclude teams not found)
    const validDifferences = differences.filter(d => d.posDifference !== '-');
    const avgPosDifference = validDifferences.length > 0 
      ? validDifferences.reduce((sum, d) => sum + d.posDifference, 0) / validDifferences.length 
      : 0;
    
    // Calculate similarity percentage
    const similarityPercentage = totalCompared > 0 
      ? Math.round((samePositionCount / totalCompared) * 100) 
      : 0;
    
    // Find largest differences (top 3)
    const biggestDifferences = sortedDifferences.slice(0, 3);
    
    return {
      similarityPercentage,
      samePositionCount,
      totalCompared,
      avgPosDifference: Math.round(avgPosDifference * 10) / 10,
      biggestDifferences
    };
  }, [user1, user2, bets]);
  
  // Reset second user when first user changes to prevent self-comparison
  const handleUser1Change = (e) => {
    const selectedUser = e.target.value;
    setUser1(selectedUser);
    if (selectedUser === user2) {
      setUser2('');
    }
  };
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">🤝</span> User Head-to-Head</h2>
      <p className="section-description">Compare predictions between two participants</p>
      
      <div className="user-comparison-controls">
        <div className="select-wrapper">
          <label htmlFor="user1-select">First Participant</label>
          <select
            id="user1-select"
            value={user1}
            onChange={handleUser1Change}
            className="user-select"
          >
            <option value="">Select a participant</option>
            {users.map(user => (
              <option key={`user1-${user}`} value={user}>{user}</option>
            ))}
          </select>
        </div>
        
        <div className="select-wrapper">
          <label htmlFor="user2-select">Second Participant</label>
          <select
            id="user2-select"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            className="user-select"
            disabled={!user1}
          >
            <option value="">Select a participant</option>
            {users
              .filter(user => user !== user1)
              .map(user => (
                <option key={`user2-${user}`} value={user}>{user}</option>
              ))
            }
          </select>
        </div>
      </div>
      
      {comparisonData ? (
        <div className="comparison-results">
          <div className="similarity-meter">
            <div className="similarity-percentage">
              <div className="percentage-value">{comparisonData.similarityPercentage}%</div>
              <div className="percentage-label">Similarity</div>
            </div>
            
            <div className="similarity-details">
              <div className="similarity-stat">
                <div className="stat-label">Same Positions</div>
                <div className="stat-value">{comparisonData.samePositionCount} / {comparisonData.totalCompared}</div>
              </div>
              
              <div className="similarity-stat">
                <div className="stat-label">Avg. Position Difference</div>
                <div className="stat-value">{comparisonData.avgPosDifference} positions</div>
              </div>
            </div>
          </div>
          
          <div className="biggest-differences">
            <h3 className="differences-title">Biggest Differences</h3>
            
            <div className="differences-table-wrapper">
              <table className="differences-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>{user1}</th>
                    <th>{user2}</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.biggestDifferences.map((diff, index) => (
                    <tr key={index}>
                      <td>{diff.position}</td>
                      <td>
                        <div className="team-name-with-logo">
                          <TeamLogo team={diff.user1Team} logoUrl={teamLogos[diff.user1Team]} />
                          <span>{diff.user1Team}</span>
                        </div>
                      </td>
                      <td>
                        <div className="team-name-with-logo">
                          <TeamLogo team={diff.user2Team} logoUrl={teamLogos[diff.user2Team]} />
                          <span>{diff.user2Team}</span>
                        </div>
                      </td>
                      <td className={diff.posDifference !== '-' ? 'difference-value' : ''}>
                        {diff.posDifference !== '-' ? `${diff.posDifference} positions` : 'Not ranked'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-comparison-data">
          {(!user1 || !user2) ? (
            <p>Select two participants to compare their predictions</p>
          ) : (
            <p>Cannot compare the same participant</p>
          )}
        </div>
      )}
    </section>
  );
};

export default UserHeadToHead;