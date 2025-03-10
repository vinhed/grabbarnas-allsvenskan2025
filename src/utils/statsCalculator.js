// src/utils/statsCalculator.js

// Calculate consensus rankings from all bets
export const calculateConsensusRankings = (bets) => {
  const allsvenskanTip2025 = {};
  
  // Calculate initial scores for each team
  for (const userBets of Object.values(bets)) {
    for (let i = 0; i < userBets.length; i++) {
      const bet = userBets[i];
      if (!allsvenskanTip2025[bet]) {
        allsvenskanTip2025[bet] = i;
      } else {
        allsvenskanTip2025[bet] += i;
      }
    }
  }
  
  // Group teams by their score
  const groupedByScore = {};
  for (const [team, score] of Object.entries(allsvenskanTip2025)) {
    if (!groupedByScore[score]) {
      groupedByScore[score] = [];
    }
    groupedByScore[score].push(team);
  }
  
  // Sort scores and within each score group, sort teams alphabetically
  const sortedAllsvenskanTip2025 = {};
  const sortedScores = Object.keys(groupedByScore).sort((a, b) => a - b);
  
  for (const score of sortedScores) {
    const teams = groupedByScore[score].sort();
    for (const team of teams) {
      sortedAllsvenskanTip2025[team] = parseInt(score);
    }
  }
  
  return sortedAllsvenskanTip2025;
};

// Helper function to format team list
const formatTeamList = (teamsList) => {
  if (teamsList.length === 1) {
    return teamsList[0];
  } else if (teamsList.length === 2) {
    return `${teamsList[0]} & ${teamsList[1]}`;
  } else {
    return `${teamsList.slice(0, -1).join(', ')} & ${teamsList[teamsList.length - 1]}`;
  }
};

// Calculate fun statistics for display
export const calculateFunStats = (bets, sortedStandings) => {
  const stats = {};
  
  // MOST PREDICTED CHAMPION
  const firstPlacePredictions = Object.values(bets)
    .filter(predictions => predictions.length > 0)
    .map(predictions => predictions[0]);
  
  const championCounter = {};
  for (const team of firstPlacePredictions) {
    championCounter[team] = (championCounter[team] || 0) + 1;
  }
  
  if (Object.keys(championCounter).length > 0) {
    const maxChampionVotes = Math.max(...Object.values(championCounter));
    const champions = Object.keys(championCounter)
      .filter(team => championCounter[team] === maxChampionVotes);
    
    stats.mostPredictedChampion = formatTeamList(champions);
    stats.championVotes = maxChampionVotes;
  }
  
  // DIRECT RELEGATION
  const directRelegationPredictions = {};
  for (const userPredictions of Object.values(bets)) {
    if (userPredictions.length >= 2) {
      // Get bottom 2 teams
      const bottomTwoTeams = userPredictions.slice(-2);
      for (const team of bottomTwoTeams) {
        directRelegationPredictions[team] = (directRelegationPredictions[team] || 0) + 1;
      }
    }
  }
  
  if (Object.keys(directRelegationPredictions).length > 0) {
    const maxRelegationVotes = Math.max(...Object.values(directRelegationPredictions));
    const relegationTeams = Object.keys(directRelegationPredictions)
      .filter(team => directRelegationPredictions[team] === maxRelegationVotes);
    
    stats.mostPredictedRelegation = formatTeamList(relegationTeams);
    stats.relegationVotes = maxRelegationVotes;
  }
  
  // PLAYOFF SPOT
  const playoffPredictions = {};
  for (const userPredictions of Object.values(bets)) {
    if (userPredictions.length >= 3) {
      // Third from bottom
      const playoffTeam = userPredictions[userPredictions.length - 3];
      playoffPredictions[playoffTeam] = (playoffPredictions[playoffTeam] || 0) + 1;
    }
  }
  
  if (Object.keys(playoffPredictions).length > 0) {
    const maxPlayoffVotes = Math.max(...Object.values(playoffPredictions));
    const playoffTeams = Object.keys(playoffPredictions)
      .filter(team => playoffPredictions[team] === maxPlayoffVotes);
    
    // Handle ties by selecting one randomly
    if (playoffTeams.length > 1) {
      stats.mostPredictedPlayoff = playoffTeams[Math.floor(Math.random() * playoffTeams.length)];
    } else {
      stats.mostPredictedPlayoff = playoffTeams[0];
    }
    stats.playoffVotes = maxPlayoffVotes;
  }
  
  // MOST DIVISIVE TEAM
  const teamPositions = {};
  for (const team of Object.keys(sortedStandings)) {
    teamPositions[team] = [];
  }
  
  for (const userPredictions of Object.values(bets)) {
    for (let pos = 0; pos < userPredictions.length; pos++) {
      const team = userPredictions[pos];
      if (teamPositions[team]) {
        teamPositions[team].push(pos + 1);
      }
    }
  }
  
  // Calculate position variance for each team
  const teamVariance = {};
  for (const [team, positions] of Object.entries(teamPositions)) {
    if (positions.length >= 2) {
      const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
      const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;
      teamVariance[team] = variance;
    }
  }
  
  if (Object.keys(teamVariance).length > 0) {
    const maxVariance = Math.max(...Object.values(teamVariance));
    const mostDivisiveTeams = Object.keys(teamVariance)
      .filter(team => teamVariance[team] === maxVariance);
    
    if (mostDivisiveTeams.length > 1) {
      stats.mostDivisiveTeam = mostDivisiveTeams[Math.floor(Math.random() * mostDivisiveTeams.length)];
    } else {
      stats.mostDivisiveTeam = mostDivisiveTeams[0];
    }
    stats.divisiveVariance = Math.round(maxVariance * 10) / 10;
    
    // Find highest agreement team (team with lowest variance)
    const minVariance = Math.min(...Object.values(teamVariance));
    const mostAgreedTeams = Object.keys(teamVariance)
      .filter(team => teamVariance[team] === minVariance);
    
    if (mostAgreedTeams.length > 1) {
      stats.mostAgreedTeam = mostAgreedTeams[Math.floor(Math.random() * mostAgreedTeams.length)];
    } else {
      stats.mostAgreedTeam = mostAgreedTeams[0];
    }
    stats.agreedVariance = Math.round(minVariance * 10) / 10;
  }
  
  // OPTIMISTIC & PESSIMISTIC PREDICTORS
  const userOptimism = {};
  for (const [user, userPredictions] of Object.entries(bets)) {
    // Calculate average predicted position for top 5 teams in consensus ranking
    const topTeams = Object.keys(sortedStandings).slice(0, 5);
    
    let totalPos = 0;
    let countedTeams = 0;
    
    for (const team of topTeams) {
      if (userPredictions.includes(team)) {
        totalPos += userPredictions.indexOf(team) + 1;
        countedTeams++;
      }
    }
    
    if (countedTeams > 0) {
      userOptimism[user] = totalPos / countedTeams;
    }
  }
  
  if (Object.keys(userOptimism).length > 0) {
    // Most optimistic user (lowest average position for top teams)
    const minOptimism = Math.min(...Object.values(userOptimism));
    const mostOptimisticUsers = Object.keys(userOptimism)
      .filter(user => userOptimism[user] === minOptimism);
    
    if (mostOptimisticUsers.length > 1) {
      stats.mostOptimistic = mostOptimisticUsers[Math.floor(Math.random() * mostOptimisticUsers.length)];
    } else {
      stats.mostOptimistic = mostOptimisticUsers[0];
    }
    
    // Most pessimistic user (highest average position for top teams)
    const maxOptimism = Math.max(...Object.values(userOptimism));
    const mostPessimisticUsers = Object.keys(userOptimism)
      .filter(user => userOptimism[user] === maxOptimism);
    
    if (mostPessimisticUsers.length > 1) {
      stats.mostPessimistic = mostPessimisticUsers[Math.floor(Math.random() * mostPessimisticUsers.length)];
    } else {
      stats.mostPessimistic = mostPessimisticUsers[0];
    }
  }
  
  // MOST UNIQUE PREDICTOR
  const userUniqueness = {};
  const theConsensusOrder = Object.keys(sortedStandings);
  
  for (const [user, userPredictions] of Object.entries(bets)) {
    let differences = 0;
    
    for (let i = 0; i < userPredictions.length; i++) {
      const team = userPredictions[i];
      if (i < theConsensusOrder.length) {
        const consensusPos = theConsensusOrder.indexOf(team);
        differences += Math.abs(i - consensusPos);
      }
    }
    
    userUniqueness[user] = differences;
  }
  
  if (Object.keys(userUniqueness).length > 0) {
    const maxUniqueness = Math.max(...Object.values(userUniqueness));
    const mostUniqueUsers = Object.keys(userUniqueness)
      .filter(user => userUniqueness[user] === maxUniqueness);
    
    if (mostUniqueUsers.length > 1) {
      stats.mostUnique = mostUniqueUsers[Math.floor(Math.random() * mostUniqueUsers.length)];
    } else {
      stats.mostUnique = mostUniqueUsers[0];
    }
  }
  
  // Calculate the average position for each team
  const teamAvgPos = {};
  for (const [team, positions] of Object.entries(teamPositions)) {
    if (positions.length > 0) {
      teamAvgPos[team] = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    }
  }
  
  // Calculate the difference between consensus ranking and average predicted ranking
  const darkHorsePotential = {};
  const consensusOrderList = Object.keys(sortedStandings);
  
  for (let i = 0; i < consensusOrderList.length; i++) {
    const team = consensusOrderList[i];
    const consensusPos = i + 1;  // Position in consensus ranking (1-based)
    
    if (teamAvgPos[team]) {
      // Positive means team is ranked better in consensus than average predictions
      // Negative means team is predicted better than consensus (dark horse)
      darkHorsePotential[team] = consensusPos - teamAvgPos[team];
    }
  }
  
  if (Object.keys(darkHorsePotential).length > 0) {
    // Find the biggest dark horse (most negative value)
    const biggestDarkHorseValue = Math.min(...Object.values(darkHorsePotential));
    const biggestDarkHorses = Object.keys(darkHorsePotential)
      .filter(team => darkHorsePotential[team] === biggestDarkHorseValue);
    
    if (biggestDarkHorses.length > 0) {
      if (biggestDarkHorses.length > 1) {
        stats.biggestDarkHorse = biggestDarkHorses[Math.floor(Math.random() * biggestDarkHorses.length)];
      } else {
        stats.biggestDarkHorse = biggestDarkHorses[0];
      }
      stats.darkHorseValue = Math.round(Math.abs(biggestDarkHorseValue) * 10) / 10;  // Show as positive positions
    }
    
    // Find the most underrated team (most positive value)
    const mostUnderratedValue = Math.max(...Object.values(darkHorsePotential));
    const mostUnderratedTeams = Object.keys(darkHorsePotential)
      .filter(team => darkHorsePotential[team] === mostUnderratedValue);
    
    if (mostUnderratedTeams.length > 0) {
      if (mostUnderratedTeams.length > 1) {
        stats.mostUnderrated = mostUnderratedTeams[Math.floor(Math.random() * mostUnderratedTeams.length)];
      } else {
        stats.mostUnderrated = mostUnderratedTeams[0];
      }
      stats.underratedValue = Math.round(mostUnderratedValue * 10) / 10;
    }
  }
  
  // THE PROPHET - user whose predictions align most closely with consensus
  const userAlignment = {};
  const theProphetConsensusOrder = Object.keys(sortedStandings);
  
  for (const [user, userPredictions] of Object.entries(bets)) {
    let totalPositionDiff = 0;
    let count = 0;
    
    for (let i = 0; i < userPredictions.length; i++) {
      const team = userPredictions[i];
      if (theProphetConsensusOrder.includes(team)) {
        const consensusPos = theProphetConsensusOrder.indexOf(team);
        totalPositionDiff += Math.abs(i - consensusPos);
        count++;
      }
    }
    
    if (count > 0) {
      userAlignment[user] = totalPositionDiff / count;
    }
  }
  
  if (Object.keys(userAlignment).length > 0) {
    // Lowest difference = closest to consensus
    const minDifference = Math.min(...Object.values(userAlignment));
    const closestUsers = Object.keys(userAlignment)
      .filter(user => userAlignment[user] === minDifference);
    
    if (closestUsers.length > 0) {
      if (closestUsers.length > 1) {
        stats.prophet = closestUsers[Math.floor(Math.random() * closestUsers.length)];
      } else {
        stats.prophet = closestUsers[0];
      }
      stats.prophetScore = Math.round(minDifference * 10) / 10;
    }
  }
  
  return stats;
};