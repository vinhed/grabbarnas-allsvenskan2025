// src/components/TeamBiasAnalyzer.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

const TeamBiasAnalyzer = ({ bets, teamLogos }) => {
  const [biasStats, setBiasStats] = useState({});
  const [teamsWithSupporters, setTeamsWithSupporters] = useState([]);
  const [activeTab, setActiveTab] = useState('bias');

  useEffect(() => {
    calculateBiasStatistics();
  }, [bets]);

  const calculateBiasStatistics = () => {
    // Skip if no bets data
    if (!bets || Object.keys(bets).length === 0) return;

    // Get list of teams that have supporters
    const supportedTeams = {};
    const supportersByTeam = {};
    const biasData = {};

    // Extract the supported teams and initialize data structures
    for (const [user, userData] of Object.entries(bets)) {
      const supportedTeam = userData.supportedTeam;
      const predictions = userData.predictions;
      
      if (supportedTeam) {
        // Track which teams have supporters
        supportedTeams[supportedTeam] = true;
        
        // Group users by supported team
        if (!supportersByTeam[supportedTeam]) {
          supportersByTeam[supportedTeam] = [];
        }
        supportersByTeam[supportedTeam].push(user);

        // Initialize bias stats for this team if not already done
        if (!biasData[supportedTeam]) {
          biasData[supportedTeam] = {
            averagePosition: 0,
            supportersCount: 0,
            highestRank: 100,
            lowestRank: 0,
            biasIndex: 0, // How much better supporters rank their team compared to others
            rivalBiasIndex: 0, // How supporters rank traditional rivals
            supporterPredictions: []
          };
        }

        // Record the position this supporter ranked their team
        const teamPosition = predictions.indexOf(supportedTeam) + 1;
        biasData[supportedTeam].supporterPredictions.push({
          user,
          position: teamPosition
        });
        
        biasData[supportedTeam].supportersCount++;
        
        // Track highest and lowest ranks
        if (teamPosition < biasData[supportedTeam].highestRank) {
          biasData[supportedTeam].highestRank = teamPosition;
        }
        if (teamPosition > biasData[supportedTeam].lowestRank) {
          biasData[supportedTeam].lowestRank = teamPosition;
        }
      }
    }

    // Map of traditional rivalries in Allsvenskan
    const rivalries = {
      'AIK': ['Djurgården', 'Hammarby', 'IFK Göteborg'],
      'Djurgården': ['AIK', 'Hammarby'],
      'Hammarby': ['AIK', 'Djurgården'],
      'IFK Göteborg': ['GAIS', 'Malmö FF', 'AIK'],
      'GAIS': ['IFK Göteborg'],
      'Malmö FF': ['IFK Göteborg', 'Helsingborgs IF']
    };

    // Calculate average position and bias indices
    for (const supportedTeam of Object.keys(biasData)) {
      const teamSupporters = biasData[supportedTeam].supporterPredictions;
      const sumPositions = teamSupporters.reduce((sum, p) => sum + p.position, 0);
      
      // Calculate average position by supporters
      biasData[supportedTeam].averagePosition = (
        sumPositions / teamSupporters.length
      ).toFixed(1);

      // Calculate average position by non-supporters
      let nonSupporterPositions = [];
      let rivalPositions = [];
      
      for (const [user, userData] of Object.entries(bets)) {
        const userSupportedTeam = userData.supportedTeam;
        const predictions = userData.predictions;
        
        if (userSupportedTeam !== supportedTeam) {
          // This user supports a different team
          const position = predictions.indexOf(supportedTeam) + 1;
          nonSupporterPositions.push(position);
          
          // Check if this user supports a rival team
          if (rivalries[supportedTeam] && 
              rivalries[supportedTeam].includes(userSupportedTeam)) {
            rivalPositions.push(position);
          }
          
          // Now calculate how this user ranked the supported team's rivals
          if (rivalries[userSupportedTeam]) {
            for (const rival of rivalries[userSupportedTeam]) {
              if (rival === supportedTeam) {
                // This is the position where a rival supporter placed this team
                const position = predictions.indexOf(supportedTeam) + 1;
                
                if (!biasData[supportedTeam].rivalPositions) {
                  biasData[supportedTeam].rivalPositions = [];
                }
                
                biasData[supportedTeam].rivalPositions.push({
                  user,
                  supportedTeam: userSupportedTeam,
                  position
                });
              }
            }
          }
        }
      }
      
      // Calculate average non-supporter position
      const avgNonSupporterPosition = 
        nonSupporterPositions.length > 0 
          ? nonSupporterPositions.reduce((sum, pos) => sum + pos, 0) / nonSupporterPositions.length 
          : 0;
      
      biasData[supportedTeam].avgNonSupporterPosition = avgNonSupporterPosition.toFixed(1);
      
      // Calculate bias index (positive = supporters rate their team higher than others do)
      biasData[supportedTeam].biasIndex = 
        (avgNonSupporterPosition - parseFloat(biasData[supportedTeam].averagePosition)).toFixed(1);
      
      // Calculate rival bias (how rival supporters rank this team)
      if (rivalPositions.length > 0) {
        const avgRivalPosition = 
          rivalPositions.reduce((sum, pos) => sum + pos, 0) / rivalPositions.length;
        
        biasData[supportedTeam].rivalBiasIndex = 
          (avgRivalPosition - avgNonSupporterPosition).toFixed(1);
      }
      
      // Calculate how supporters rank their rivals
      if (rivalries[supportedTeam]) {
        biasData[supportedTeam].supporterRivalRankings = {};
        
        for (const rival of rivalries[supportedTeam]) {
          let supporterRivalPositions = [];
          
          for (const [user, userData] of Object.entries(bets)) {
            const userSupportedTeam = userData.supportedTeam;
            const predictions = userData.predictions;
            
            if (userSupportedTeam === supportedTeam) {
              // This user supports the team we're analyzing
              const position = predictions.indexOf(rival) + 1;
              supporterRivalPositions.push(position);
            }
          }
          
          if (supporterRivalPositions.length > 0) {
            const avgPosition = 
              supporterRivalPositions.reduce((sum, pos) => sum + pos, 0) / supporterRivalPositions.length;
            
            biasData[supportedTeam].supporterRivalRankings[rival] = avgPosition.toFixed(1);
          }
        }
      }
    }

    setBiasStats(biasData);
    setTeamsWithSupporters(Object.keys(supportedTeams));
  };

  // Skip rendering if no supporter data
  if (!bets || Object.keys(bets).length === 0 || teamsWithSupporters.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">❤️</span> Team Support & Bias Analysis</h2>
      
      {/* Tabs for switching between views */}
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'bias' ? 'active' : ''}`}
          onClick={() => setActiveTab('bias')}
        >
          Fan Bias
        </button>
        <button 
          className={`tab-button ${activeTab === 'supporters' ? 'active' : ''}`}
          onClick={() => setActiveTab('supporters')}
        >
          Team Supporters
        </button>
        <button 
          className={`tab-button ${activeTab === 'rivalries' ? 'active' : ''}`}
          onClick={() => setActiveTab('rivalries')}
        >
          Rivalries
        </button>
      </div>
      
      {/* Fan Bias Tab */}
      {activeTab === 'bias' && (
        <div className="tab-content">
          <div className="table-wrapper">
            <table className="bias-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Supporters</th>
                  <th>Avg. Position (Fans)</th>
                  <th>Avg. Position (Others)</th>
                  <th>Bias Index</th>
                  <th>Highest</th>
                  <th>Lowest</th>
                </tr>
              </thead>
              <tbody>
                {teamsWithSupporters.map(team => {
                  const stats = biasStats[team];
                  
                  // Calculate bias intensity for styling
                  const biasValue = parseFloat(stats.biasIndex);
                  let biasClass = '';
                  
                  if (biasValue > 2) biasClass = 'high-positive-bias';
                  else if (biasValue > 0) biasClass = 'positive-bias';
                  else if (biasValue < -2) biasClass = 'high-negative-bias';
                  else if (biasValue < 0) biasClass = 'negative-bias';
                  
                  return (
                    <tr key={team}>
                      <td>
                        <div className="team-name-with-logo">
                          <TeamLogo team={team} logoUrl={teamLogos[team]} />
                          <span>{team}</span>
                        </div>
                      </td>
                      <td>{stats.supportersCount}</td>
                      <td>{stats.averagePosition}</td>
                      <td>{stats.avgNonSupporterPosition}</td>
                      <td className={biasClass}>{stats.biasIndex}</td>
                      <td>{stats.highestRank}</td>
                      <td>{stats.lowestRank}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="explanation-box">
            <h3>Bias Index Explained</h3>
            <p>
              The Bias Index shows how much better or worse fans rank their own team compared to everyone else.
              A positive number means fans rank their team higher (better) than non-fans do.
              A negative number means fans are more pessimistic about their team than others.
            </p>
          </div>
        </div>
      )}
      
      {/* Team Supporters Tab */}
      {activeTab === 'supporters' && (
        <div className="tab-content">
          <div className="supporters-grid">
            {teamsWithSupporters.map(team => {
              // Group users by the team they support
              const supporters = [];
              
              for (const [user, userData] of Object.entries(bets)) {
                if (userData.supportedTeam === team) {
                  const position = userData.predictions.indexOf(team) + 1;
                  supporters.push({ user, position });
                }
              }
              
              // Sort by team position (more optimistic first)
              supporters.sort((a, b) => a.position - b.position);
              
              return (
                <div key={team} className="supporter-card">
                  <div className="supporter-card-header">
                    <div className="team-name-with-logo">
                      <TeamLogo team={team} logoUrl={teamLogos[team]} />
                      <span>{team} Supporters</span>
                    </div>
                    <div className="supporter-count">{supporters.length} Fans</div>
                  </div>
                  
                  <div className="supporter-list">
                    {supporters.map(({ user, position }) => (
                      <div key={user} className="supporter-item">
                        <span className="supporter-name">{user}</span>
                        <span className="supporter-rank">
                          Predicted: <strong>{position}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Rivalries Tab */}
      {activeTab === 'rivalries' && (
        <div className="tab-content">
          <div className="table-wrapper">
            <table className="rivalry-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Position by Rivals</th>
                  <th>Position by Others</th>
                  <th>Rivalry Bias</th>
                  <th>How Fans Rank Rivals</th>
                </tr>
              </thead>
              <tbody>
                {teamsWithSupporters.map(team => {
                  const stats = biasStats[team];
                  if (!stats.rivalBiasIndex) return null;
                  
                  // Determine if rivalry bias is significant
                  const rivalBias = parseFloat(stats.rivalBiasIndex);
                  let rivalBiasClass = '';
                  
                  if (rivalBias > 2) rivalBiasClass = 'high-negative-bias';
                  else if (rivalBias > 0) rivalBiasClass = 'negative-bias';
                  else if (rivalBias < -2) rivalBiasClass = 'high-positive-bias';
                  else if (rivalBias < 0) rivalBiasClass = 'positive-bias';
                  
                  // Format rival rankings
                  let rivalRankings = '';
                  if (stats.supporterRivalRankings) {
                    rivalRankings = Object.entries(stats.supporterRivalRankings)
                      .map(([rival, position]) => `${rival}: ${position}`)
                      .join(', ');
                  }
                  
                  // Calculate average position by rival supporters
                  let rivalAvgPosition = 'N/A';
                  if (stats.rivalPositions && stats.rivalPositions.length > 0) {
                    const sum = stats.rivalPositions.reduce((acc, p) => acc + p.position, 0);
                    rivalAvgPosition = (sum / stats.rivalPositions.length).toFixed(1);
                  }
                  
                  return (
                    <tr key={team}>
                      <td>
                        <div className="team-name-with-logo">
                          <TeamLogo team={team} logoUrl={teamLogos[team]} />
                          <span>{team}</span>
                        </div>
                      </td>
                      <td>{rivalAvgPosition}</td>
                      <td>{stats.avgNonSupporterPosition}</td>
                      <td className={rivalBiasClass}>{stats.rivalBiasIndex}</td>
                      <td>{rivalRankings || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="explanation-box">
            <h3>Rivalry Bias Explained</h3>
            <p>
              The Rivalry Bias shows how supporters of rival teams rank this team compared to the average.
              A positive number means rivals rank the team lower (worse) than non-rivals do.
              The "How Fans Rank Rivals" column shows the average position each team's supporters give to their traditional rivals.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamBiasAnalyzer;