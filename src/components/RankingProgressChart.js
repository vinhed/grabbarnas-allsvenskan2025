import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './RankingProgressChart.css';

const RankingProgressChart = ({ historyData, bets, selectedParticipants = [] }) => {
  const [startRound, setStartRound] = useState(1);
  const [endRound, setEndRound] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  
  useEffect(() => {
    if (historyData) {
      const rounds = getCompleteRounds();
      setAvailableRounds(rounds);
      if (rounds.length > 0) {
        setStartRound(rounds[0]);
        setEndRound(rounds[rounds.length - 1]);
      }
    }
  }, [historyData]);
  
  if (!historyData || !bets) return null;
  
  const getCompleteRounds = () => {
    const roundMatchCounts = {};
    const teamsPerRound = 16;
    const matchesPerRound = teamsPerRound / 2;
    
    historyData.documents.forEach(doc => {
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

  const processChartData = () => {
    const chartData = [];
    const sortedRounds = getCompleteRounds();
    
    const roundsToShow = sortedRounds.filter(round => 
      round >= startRound && round <= endRound
    );
    
    roundsToShow.forEach(round => {
      const matchesUpToRound = historyData.documents.filter(doc => {
        const matchRound = parseInt(doc.fields?.round?.integerValue || 0);
        const status = doc.fields?.status?.stringValue;
        return matchRound <= round && status === 'FINISHED';
      });
      
      const standings = calculateStandingsFromMatches(matchesUpToRound);
      const performance = calculatePerformanceForRound(bets, standings);
      
      const roundData = { round: `R${round}` };
      performance.forEach((person) => {
        roundData[person.person] = parseFloat(person.averageRating);
      });
      
      chartData.push(roundData);
    });
    
    return chartData;
  };
  
  const calculateStandingsFromMatches = (matches) => {
    const teamStats = {};
    
    matches.forEach(match => {
      const homeTeam = match.fields?.homeTeamName?.stringValue;
      const awayTeam = match.fields?.visitingTeamName?.stringValue;
      
      if (homeTeam && !teamStats[homeTeam]) {
        teamStats[homeTeam] = { 
          team: homeTeam, points: 0, goalDifference: 0, goalsFor: 0 
        };
      }
      if (awayTeam && !teamStats[awayTeam]) {
        teamStats[awayTeam] = { 
          team: awayTeam, points: 0, goalDifference: 0, goalsFor: 0 
        };
      }
    });
    
    matches.forEach(match => {
      const homeTeam = match.fields?.homeTeamName?.stringValue;
      const awayTeam = match.fields?.visitingTeamName?.stringValue;
      const homeScore = parseInt(match.fields?.homeTeamScore?.integerValue || 0);
      const awayScore = parseInt(match.fields?.visitingTeamScore?.integerValue || 0);
      
      if (homeTeam && awayTeam && teamStats[homeTeam] && teamStats[awayTeam]) {
        teamStats[homeTeam].goalsFor += homeScore;
        teamStats[homeTeam].goalDifference += (homeScore - awayScore);
        teamStats[awayTeam].goalsFor += awayScore;
        teamStats[awayTeam].goalDifference += (awayScore - homeScore);
        
        if (homeScore > awayScore) {
          teamStats[homeTeam].points += 3;
        } else if (homeScore < awayScore) {
          teamStats[awayTeam].points += 3;
        } else {
          teamStats[homeTeam].points += 1;
          teamStats[awayTeam].points += 1;
        }
      }
    });
    
    const sortedTeams = Object.values(teamStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    
    return sortedTeams.map(team => team.team);
  };
  
  const calculatePerformanceForRound = (predictions, actualStandings) => {
    const results = [];
    
    for (const [person, prediction] of Object.entries(predictions)) {
      if (!Array.isArray(prediction)) continue;
      
      let totalDifference = 0;
      let teamsMatched = 0;
      
      for (let i = 0; i < prediction.length; i++) {
        const team = prediction[i];
        const predictedPosition = i + 1;
        const actualPosition = actualStandings.findIndex(t => t === team) + 1;
        
        if (actualPosition > 0) {
          totalDifference += Math.abs(predictedPosition - actualPosition);
          teamsMatched++;
        }
      }
      
      const maxPossibleScore = 100;
      const penaltyPerPosition = maxPossibleScore / (teamsMatched * 8);
      const score = Math.max(0, maxPossibleScore - (totalDifference * penaltyPerPosition));
      const averageRating = score.toFixed(1);
      
      results.push({
        person,
        averageRating
      });
    }
    
    return results.sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating));
  };
  
  const chartData = processChartData();
  const participants = Object.keys(bets);
  
  const colors = ['#3a86ff', '#06d6a0', '#ffd166', '#ef476f', '#9d4edd', '#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a0ca3', '#7209b7', '#f72585'];
  
  const customTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      
      return (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '5px' }}>
            {label}
          </p>
          {sortedPayload.map((entry, index) => (
            <p key={entry.dataKey} style={{ color: entry.color, margin: '2px 0' }}>
              {index + 1}. {entry.dataKey}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const handleStartRoundChange = (value) => {
    const newStart = parseInt(value);
    setStartRound(newStart);
    if (newStart > endRound) {
      setEndRound(newStart);
    }
  };
  
  const handleEndRoundChange = (value) => {
    const newEnd = parseInt(value);
    setEndRound(newEnd);
    if (newEnd < startRound) {
      setStartRound(newEnd);
    }
  };
  
  return (
    <div className="ranking-chart-container">
      <h3 className="chart-title">Score Progression</h3>
      
      <div className="round-range-selector">
        <div className="range-control">
          <label>From Round:</label>
          <select 
            value={startRound} 
            onChange={(e) => handleStartRoundChange(e.target.value)}
            className="round-select"
          >
            {availableRounds.map(round => (
              <option key={round} value={round}>Round {round}</option>
            ))}
          </select>
        </div>
        <div className="range-control">
          <label>To Round:</label>
          <select 
            value={endRound || ''} 
            onChange={(e) => handleEndRoundChange(e.target.value)}
            className="round-select"
          >
            {availableRounds.filter(r => r >= startRound).map(round => (
              <option key={round} value={round}>Round {round}</option>
            ))}
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="round" 
            stroke="var(--text-secondary)"
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']}
            stroke="var(--text-secondary)"
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            content={customTooltipContent}
          />
          <Legend 
            wrapperStyle={{ color: 'var(--text-primary)' }}
          />
          {participants.map((person, index) => (
            <Line
              key={person}
              type="linear"
              dataKey={person}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RankingProgressChart;