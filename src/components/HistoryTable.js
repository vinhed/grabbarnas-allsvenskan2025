import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';
import RankingProgressChart from './RankingProgressChart';
import './HistoryTable.css';

const HistoryTable = ({ bets, teamLogos, supportedTeams, isMobile }) => {
  const [historyData, setHistoryData] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [roundPerformance, setRoundPerformance] = useState([]);
  const [previousRoundPerformance, setPreviousRoundPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://wggook008s4ko4c0g0gcssgk.kopply.se/api/allsvenskan/history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      
      const data = await response.json();
      setHistoryData(data);
      
      const rounds = extractRounds(data.documents);
      setAvailableRounds(rounds);
      
      if (rounds.length > 0) {
        const latestRound = Math.max(...rounds);
        setSelectedRound(latestRound);
        calculateRoundPerformance(data.documents, latestRound);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data');
      setLoading(false);
    }
  };

  const extractRounds = (documents) => {
    const roundMatchCounts = {};
    const teamsPerRound = 16;
    const matchesPerRound = teamsPerRound / 2;
    
    documents.forEach(doc => {
      if (doc.fields?.round?.integerValue && doc.fields?.status?.stringValue === 'FINISHED') {
        const round = parseInt(doc.fields.round.integerValue);
        roundMatchCounts[round] = (roundMatchCounts[round] || 0) + 1;
      }
    });
    
    const completeRounds = [];
    for (const [round, count] of Object.entries(roundMatchCounts)) {
      if (count === matchesPerRound) {
        completeRounds.push(parseInt(round));
      }
    }
    
    return completeRounds.sort((a, b) => a - b);
  };

  const calculateRoundPerformance = (documents, round) => {
    const matchesUpToRound = documents.filter(doc => {
      const matchRound = parseInt(doc.fields?.round?.integerValue || 0);
      const status = doc.fields?.status?.stringValue;
      return matchRound <= round && status === 'FINISHED';
    });

    const standings = calculateStandingsFromMatches(matchesUpToRound);
    
    const performance = calculatePerformanceMetrics(bets, standings, round);
    setRoundPerformance(performance);
  };

  const calculateStandingsFromMatches = (matches) => {
    const teamStats = {};
    
    matches.forEach(match => {
      const homeTeam = match.fields?.homeTeamName?.stringValue;
      const awayTeam = match.fields?.visitingTeamName?.stringValue;
      
      if (homeTeam && !teamStats[homeTeam]) {
        teamStats[homeTeam] = { 
          team: homeTeam, 
          played: 0, 
          won: 0, 
          drawn: 0, 
          lost: 0, 
          goalsFor: 0, 
          goalsAgainst: 0, 
          goalDifference: 0, 
          points: 0 
        };
      }
      
      if (awayTeam && !teamStats[awayTeam]) {
        teamStats[awayTeam] = { 
          team: awayTeam, 
          played: 0, 
          won: 0, 
          drawn: 0, 
          lost: 0, 
          goalsFor: 0, 
          goalsAgainst: 0, 
          goalDifference: 0, 
          points: 0 
        };
      }
    });
    
    matches.forEach(match => {
      const homeTeam = match.fields?.homeTeamName?.stringValue;
      const awayTeam = match.fields?.visitingTeamName?.stringValue;
      const homeScore = parseInt(match.fields?.homeTeamScore?.integerValue || 0);
      const awayScore = parseInt(match.fields?.visitingTeamScore?.integerValue || 0);
      
      if (homeTeam && awayTeam && teamStats[homeTeam] && teamStats[awayTeam]) {
        teamStats[homeTeam].played++;
        teamStats[awayTeam].played++;
        
        teamStats[homeTeam].goalsFor += homeScore;
        teamStats[homeTeam].goalsAgainst += awayScore;
        teamStats[awayTeam].goalsFor += awayScore;
        teamStats[awayTeam].goalsAgainst += homeScore;
        
        if (homeScore > awayScore) {
          teamStats[homeTeam].won++;
          teamStats[homeTeam].points += 3;
          teamStats[awayTeam].lost++;
        } else if (homeScore < awayScore) {
          teamStats[awayTeam].won++;
          teamStats[awayTeam].points += 3;
          teamStats[homeTeam].lost++;
        } else {
          teamStats[homeTeam].drawn++;
          teamStats[awayTeam].drawn++;
          teamStats[homeTeam].points += 1;
          teamStats[awayTeam].points += 1;
        }
        
        teamStats[homeTeam].goalDifference = teamStats[homeTeam].goalsFor - teamStats[homeTeam].goalsAgainst;
        teamStats[awayTeam].goalDifference = teamStats[awayTeam].goalsFor - teamStats[awayTeam].goalsAgainst;
      }
    });
    
    const sortedTeams = Object.values(teamStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    
    return sortedTeams.map(team => team.team);
  };

  const calculatePerformanceMetrics = (predictions, actualStandings, round) => {
    const results = [];
    
    for (const [person, prediction] of Object.entries(predictions)) {
      if (!Array.isArray(prediction)) continue;
      
      let totalDifference = 0;
      let perfectPicks = 0;
      let top3Correct = 0;
      let relegationCorrect = 0;
      let teamsMatched = 0;
      
      for (let i = 0; i < prediction.length; i++) {
        const team = prediction[i];
        const predictedPosition = i + 1;
        
        const actualPosition = actualStandings.findIndex(t => t === team) + 1;
        
        if (actualPosition > 0) {
          const positionDifference = Math.abs(predictedPosition - actualPosition);
          totalDifference += positionDifference;
          teamsMatched++;
          
          if (positionDifference === 0) {
            perfectPicks++;
          }
          
          if (actualPosition <= 3 && predictedPosition <= 3) {
            top3Correct++;
          }
          
          const totalTeams = prediction.length;
          if (actualPosition > totalTeams - 3 && predictedPosition > totalTeams - 3) {
            relegationCorrect++;
          }
        }
      }
      
      const maxPossibleScore = 100;
      const penaltyPerPosition = maxPossibleScore / (teamsMatched * 8);
      const score = Math.max(0, maxPossibleScore - (totalDifference * penaltyPerPosition));
      const averageRating = score.toFixed(1);
      
      results.push({
        person,
        round,
        averageRating,
        perfectPicks,
        top3Accuracy: ((top3Correct / 3) * 100).toFixed(0),
        relegationAccuracy: ((relegationCorrect / 3) * 100).toFixed(0),
        supportedTeam: supportedTeams[person]
      });
    }
    
    return results.sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating));
  };

  const handleRoundChange = (round) => {
    setSelectedRound(round);
    if (historyData) {
      calculateRoundPerformance(historyData.documents, round);
      
      if (round > 1 && availableRounds.includes(round - 1)) {
        const prevRoundMatches = historyData.documents.filter(doc => {
          const matchRound = parseInt(doc.fields?.round?.integerValue || 0);
          const status = doc.fields?.status?.stringValue;
          return matchRound <= (round - 1) && status === 'FINISHED';
        });
        
        const prevStandings = calculateStandingsFromMatches(prevRoundMatches);
        const prevPerformance = calculatePerformanceMetrics(bets, prevStandings, round - 1);
        setPreviousRoundPerformance(prevPerformance);
      } else {
        setPreviousRoundPerformance([]);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading history data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="section">
      <h2 className="section-title">
        <span className="icon">📈</span> Historical Rankings
      </h2>
      
      <div className="round-selector">
        <label htmlFor="round-select">Select Round:</label>
        <div className="round-navigation">
          <button 
            className="round-nav-btn"
            onClick={() => handleRoundChange(selectedRound - 1)}
            disabled={!selectedRound || !availableRounds.includes(selectedRound - 1)}
          >
            ←
          </button>
          <select 
            id="round-select"
            value={selectedRound || ''} 
            onChange={(e) => handleRoundChange(parseInt(e.target.value))}
            className="round-dropdown"
          >
            {availableRounds.map(round => (
              <option key={round} value={round}>
                Round {round}
              </option>
            ))}
          </select>
          <button 
            className="round-nav-btn"
            onClick={() => handleRoundChange(selectedRound + 1)}
            disabled={!selectedRound || !availableRounds.includes(selectedRound + 1)}
          >
            →
          </button>
        </div>
      </div>
      
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Participant</th>
              <th>Score</th>
              <th>Perfect</th>
              <th>Top 3</th>
              <th>Relegation</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {roundPerformance.map((person, index) => {
              const position = index + 1;
              const medalClass = position <= 3 ? `medal-${position}` : "";
              
              let previousPosition = null;
              let positionChange = '-';
              let changeClass = 'same';
              
              if (previousRoundPerformance.length > 0) {
                const prevIndex = previousRoundPerformance.findIndex(p => p.person === person.person);
                if (prevIndex !== -1) {
                  previousPosition = prevIndex + 1;
                  const change = previousPosition - position;
                  
                  if (change > 0) {
                    positionChange = `↑${change}`;
                    changeClass = 'up';
                  } else if (change < 0) {
                    positionChange = `↓${Math.abs(change)}`;
                    changeClass = 'down';
                  } else {
                    positionChange = '→';
                    changeClass = 'same';
                  }
                } else {
                  positionChange = 'NEW';
                  changeClass = 'new';
                }
              }
              
              return (
                <tr key={person.person} className={medalClass}>
                  <td>{position}</td>
                  <td>
                    <div className="participant-with-team">
                      <span>{person.person}</span>
                      {person.supportedTeam && teamLogos[person.supportedTeam] && (
                        <TeamLogo 
                          team={person.supportedTeam} 
                          logoUrl={teamLogos[person.supportedTeam]} 
                          size="small" 
                        />
                      )}
                    </div>
                  </td>
                  <td className="performance-rating">{person.averageRating}</td>
                  <td className="perfect-picks">{person.perfectPicks}</td>
                  <td className="top3-accuracy">{person.top3Accuracy}%</td>
                  <td className="relegation-accuracy">{person.relegationAccuracy}%</td>
                  <td className={`position-change ${changeClass}`}>
                    {positionChange}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="history-info">
        <p>Showing rankings after Round {selectedRound}</p>
      </div>
      
      {historyData && (
        <RankingProgressChart 
          historyData={historyData}
          bets={bets}
        />
      )}
    </section>
  );
};

export default HistoryTable;