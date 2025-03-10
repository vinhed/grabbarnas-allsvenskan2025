// src/utils/statsCalculator.js

// Import the formatting helper
import { formatList } from './formatHelpers';

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

// Calculate fun statistics for display
export const calculateFunStats = (bets, sortedStandings, supportedTeams = {}) => {
  const stats = {};
  
  // Store user predictions for use in other calculations
  stats.userPredictions = bets;
  
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
    
    stats.mostPredictedChampion = formatList(champions);
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
    
    stats.mostPredictedRelegation = formatList(relegationTeams);
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
    
    stats.mostPredictedPlayoff = formatList(playoffTeams);
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
    
    stats.mostDivisiveTeam = formatList(mostDivisiveTeams);
    stats.divisiveVariance = Math.round(maxVariance * 10) / 10;
    
    // Find highest agreement team (team with lowest variance)
    const minVariance = Math.min(...Object.values(teamVariance));
    const mostAgreedTeams = Object.keys(teamVariance)
      .filter(team => teamVariance[team] === minVariance);
    
    stats.mostAgreedTeam = formatList(mostAgreedTeams);
    stats.agreedVariance = Math.round(minVariance * 10) / 10;
  }
  
  // OPTIMISTIC & PESSIMISTIC PREDICTORS - Updated calculation with more precision
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
    // Calculate with full precision to break potential ties
    userOptimism[user] = totalPos / countedTeams;
  }
}

if (Object.keys(userOptimism).length > 0) {
  // Most optimistic user (lowest average position for top teams)
  // Use full precision for comparison, but only 1 decimal for display
  const minOptimism = Math.min(...Object.values(userOptimism));
  const mostOptimisticUsers = Object.keys(userOptimism)
    .filter(user => Math.abs(userOptimism[user] - minOptimism) < 0.0001); // Allow tiny floating point differences
  
  // Even with more precision, we might still have ties
  // In case of an exact tie, choose the one with the highest position for the #1 team
  if (mostOptimisticUsers.length > 1) {
    const topTeam = Object.keys(sortedStandings)[0];
    let bestPosition = Infinity;
    let finalOptimist = mostOptimisticUsers[0];
    
    for (const user of mostOptimisticUsers) {
      const userPredictions = bets[user];
      if (userPredictions.includes(topTeam)) {
        const position = userPredictions.indexOf(topTeam) + 1;
        if (position < bestPosition) {
          bestPosition = position;
          finalOptimist = user;
        }
      }
    }
    
    stats.mostOptimistic = finalOptimist;
  } else {
    stats.mostOptimistic = mostOptimisticUsers[0];
  }
  
  // Store the score with 1 decimal place for display
  stats.optimismScore = Math.round(minOptimism * 10) / 10;
  
  // Most pessimistic user (highest average position for top teams)
  const maxOptimism = Math.max(...Object.values(userOptimism));
  const mostPessimisticUsers = Object.keys(userOptimism)
    .filter(user => Math.abs(userOptimism[user] - maxOptimism) < 0.0001);
  
  // In case of a tie, choose the one with the lowest position for the #1 team
  if (mostPessimisticUsers.length > 1) {
    const topTeam = Object.keys(sortedStandings)[0];
    let worstPosition = -1;
    let finalPessimist = mostPessimisticUsers[0];
    
    for (const user of mostPessimisticUsers) {
      const userPredictions = bets[user];
      if (userPredictions.includes(topTeam)) {
        const position = userPredictions.indexOf(topTeam) + 1;
        if (position > worstPosition) {
          worstPosition = position;
          finalPessimist = user;
        }
      }
    }
    
    stats.mostPessimistic = finalPessimist;
  } else {
    stats.mostPessimistic = mostPessimisticUsers[0];
  }
  
  // Store the score with 1 decimal place for display
  stats.pessimismScore = Math.round(maxOptimism * 10) / 10;
}
  
// MOST UNIQUE PREDICTOR - with improved tiebreaking
const userUniqueness = {};
const theConsensusOrder = Object.keys(sortedStandings);

for (const [user, userPredictions] of Object.entries(bets)) {
  let differences = 0;
  let weightedDifferences = 0; // Used for tiebreaking - gives more weight to top positions
  
  for (let i = 0; i < userPredictions.length; i++) {
    const team = userPredictions[i];
    if (i < theConsensusOrder.length) {
      const consensusPos = theConsensusOrder.indexOf(team);
      const posDiff = Math.abs(i - consensusPos);
      differences += posDiff;
      
      // Weight differences in top positions more heavily (for tiebreaking)
      const weight = Math.max(1, 16 - i) / 8; // Gives higher weight to top positions
      weightedDifferences += posDiff * weight;
    }
  }
  
  userUniqueness[user] = {
    differences,
    weightedDifferences // Used only for tiebreaking
  };
}

if (Object.keys(userUniqueness).length > 0) {
  const maxDifferences = Math.max(...Object.values(userUniqueness).map(u => u.differences));
  const mostUniqueUsers = Object.keys(userUniqueness)
    .filter(user => userUniqueness[user].differences === maxDifferences);
  
  // If we have a tie based on raw differences, use weighted differences to break it
  if (mostUniqueUsers.length > 1) {
    let maxWeightedDiff = -1;
    let finalUnique = mostUniqueUsers[0];
    
    for (const user of mostUniqueUsers) {
      if (userUniqueness[user].weightedDifferences > maxWeightedDiff) {
        maxWeightedDiff = userUniqueness[user].weightedDifferences;
        finalUnique = user;
      }
    }
    
    stats.mostUnique = finalUnique;
  } else {
    stats.mostUnique = mostUniqueUsers[0];
  }
  
  stats.uniquenessScore = maxDifferences;
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
      stats.biggestDarkHorse = formatList(biggestDarkHorses);
      stats.darkHorseValue = Math.round(Math.abs(biggestDarkHorseValue) * 10) / 10;  // Show as positive positions
    }
    
    // Find the most underrated team (most positive value)
    const mostUnderratedValue = Math.max(...Object.values(darkHorsePotential));
    const mostUnderratedTeams = Object.keys(darkHorsePotential)
      .filter(team => darkHorsePotential[team] === mostUnderratedValue);
    
    if (mostUnderratedTeams.length > 0) {
      stats.mostUnderrated = formatList(mostUnderratedTeams);
      stats.underratedValue = Math.round(mostUnderratedValue * 10) / 10;
    }
  }

  // DARK HORSE AND UNDERRATED TEAMS - with better tiebreaking
if (Object.keys(darkHorsePotential).length > 0) {
  // Find the biggest dark horse (most negative value)
  const biggestDarkHorseValue = Math.min(...Object.values(darkHorsePotential));
  const biggestDarkHorses = Object.keys(darkHorsePotential)
    .filter(team => Math.abs(darkHorsePotential[team] - biggestDarkHorseValue) < 0.0001);
  
  if (biggestDarkHorses.length > 1) {
    // Tiebreaker: the team with better consensus position (lower is better)
    let bestConsensusPos = Infinity;
    let finalDarkHorseTeam = biggestDarkHorses[0];
    
    for (const team of biggestDarkHorses) {
      const consensusPos = Object.keys(sortedStandings).indexOf(team) + 1;
      if (consensusPos < bestConsensusPos) {
        bestConsensusPos = consensusPos;
        finalDarkHorseTeam = team;
      }
    }
    
    stats.biggestDarkHorse = finalDarkHorseTeam;
  } else {
    stats.biggestDarkHorse = biggestDarkHorses[0];
  }
  stats.darkHorseValue = Math.round(Math.abs(biggestDarkHorseValue) * 10) / 10;  // Show as positive positions with 1 decimal
  
  // Find the most underrated team (most positive value)
  const mostUnderratedValue = Math.max(...Object.values(darkHorsePotential));
  const mostUnderratedTeams = Object.keys(darkHorsePotential)
    .filter(team => Math.abs(darkHorsePotential[team] - mostUnderratedValue) < 0.0001);
  
  if (mostUnderratedTeams.length > 1) {
    // Tiebreaker: the team with worse consensus position (higher is worse, more impressive to be underrated)
    let worstConsensusPos = -1;
    let finalUnderratedTeam = mostUnderratedTeams[0];
    
    for (const team of mostUnderratedTeams) {
      const consensusPos = Object.keys(sortedStandings).indexOf(team) + 1;
      if (consensusPos > worstConsensusPos) {
        worstConsensusPos = consensusPos;
        finalUnderratedTeam = team;
      }
    }
    
    stats.mostUnderrated = finalUnderratedTeam;
  } else {
    stats.mostUnderrated = mostUnderratedTeams[0];
  }
  stats.underratedValue = Math.round(mostUnderratedValue * 10) / 10; // 1 decimal place
}
  
  // THE PROPHET - user whose predictions align most closely with consensus
const userAlignment = {};
const theProphetConsensusOrder = Object.keys(sortedStandings);

for (const [user, userPredictions] of Object.entries(bets)) {
  let totalPositionDiff = 0;
  let count = 0;
  let weightedPositionDiff = 0; // For tiebreaking
  
  for (let i = 0; i < userPredictions.length; i++) {
    const team = userPredictions[i];
    if (theProphetConsensusOrder.includes(team)) {
      const consensusPos = theProphetConsensusOrder.indexOf(team);
      const posDiff = Math.abs(i - consensusPos);
      totalPositionDiff += posDiff;
      
      // Weight top positions more heavily (for tiebreaking)
      const weight = Math.max(1, 16 - i) / 8;
      weightedPositionDiff += posDiff * weight;
      
      count++;
    }
  }
  
  if (count > 0) {
    userAlignment[user] = {
      avgDiff: totalPositionDiff / count,
      weightedAvgDiff: weightedPositionDiff / count // For tiebreaking
    };
  }
}

if (Object.keys(userAlignment).length > 0) {
  // Lowest difference = closest to consensus
  const minDifference = Math.min(...Object.values(userAlignment).map(u => u.avgDiff));
  const closestUsers = Object.keys(userAlignment)
    .filter(user => Math.abs(userAlignment[user].avgDiff - minDifference) < 0.0001);
  
  // In case of a tie, use weighted differences to break it (lower is better)
  if (closestUsers.length > 1) {
    let minWeightedDiff = Infinity;
    let finalProphet = closestUsers[0];
    
    for (const user of closestUsers) {
      if (userAlignment[user].weightedAvgDiff < minWeightedDiff) {
        minWeightedDiff = userAlignment[user].weightedAvgDiff;
        finalProphet = user;
      }
    }
    
    stats.prophet = finalProphet;
  } else {
    stats.prophet = closestUsers[0];
  }
  
  stats.prophetScore = Math.round(minDifference * 10) / 10; // Display with 1 decimal
}
  
  // MOST POLARIZING TEAM - with improved tiebreaking
const teamPositionRanges = {};
const teamPositionExtremes = {};
const polarizationScores = {};
const teamMetrics = {};

for (const [team, positions] of Object.entries(teamPositions)) {
  if (positions.length >= 3) {
    // Sort positions to find min and max
    const sortedPositions = [...positions].sort((a, b) => a - b);
    const minPosition = sortedPositions[0];
    const maxPosition = sortedPositions[sortedPositions.length - 1];
    
    // Calculate range
    const range = maxPosition - minPosition;
    teamPositionRanges[team] = range;
    
    // Store more detailed metrics for potential tiebreaking
    const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;
    const consensusPos = Object.keys(sortedStandings).indexOf(team) + 1;
    
    // Keep track of extremes
    const hasTop3 = positions.some(p => p <= 3);
    const hasBottom5 = positions.some(p => p >= Object.keys(sortedStandings).length - 4);
    
    teamPositionExtremes[team] = {
      min: minPosition,
      max: maxPosition,
      hasTop3,
      hasBottom5
    };
    
    // Calculate a polarization score
    // Weighted by how extreme the positions are and if it has both top and bottom placements
    let polarizationScore = range * 10 + variance;
    
    // Bonus for having both very high and very low predictions
    if (hasTop3 && hasBottom5) {
      polarizationScore += 50;
    }
    
    // Bonus for extreme positions
    if (minPosition === 1) polarizationScore += 30;
    if (maxPosition >= Object.keys(sortedStandings).length - 1) polarizationScore += 30;
    
    polarizationScores[team] = polarizationScore;
    
    // Store all metrics for tiebreaking
    teamMetrics[team] = {
      range,
      variance,
      mean,
      consensusPos,
      minPosition,
      maxPosition,
      hasTop3,
      hasBottom5,
      polarizationScore
    };
  }
}

// Find most polarizing team (highest polarization score)
if (Object.keys(polarizationScores).length > 0) {
  const maxPolarizationScore = Math.max(...Object.values(polarizationScores));
  const mostPolarizingTeams = Object.keys(polarizationScores)
    .filter(team => Math.abs(polarizationScores[team] - maxPolarizationScore) < 0.0001);
  
  // In case of a tie, use the team with higher variance
  if (mostPolarizingTeams.length > 1) {
    let maxVariance = -1;
    let finalPolarizingTeam = mostPolarizingTeams[0];
    
    for (const team of mostPolarizingTeams) {
      if (teamMetrics[team].variance > maxVariance) {
        maxVariance = teamMetrics[team].variance;
        finalPolarizingTeam = team;
      }
    }
    
    stats.mostPolarizingTeam = finalPolarizingTeam;
  } else {
    stats.mostPolarizingTeam = mostPolarizingTeams[0];
  }
  
  // Create description based on actual data
  const extremes = teamPositionExtremes[stats.mostPolarizingTeam];
  stats.polarizingRange = `${extremes.min} to ${extremes.max}`;
}

// Find team with most consistent predictions (smallest range between highest and lowest prediction)
if (Object.keys(teamPositionRanges).length > 0) {
  const minRange = Math.min(...Object.values(teamPositionRanges));
  const consistentTeams = Object.keys(teamPositionRanges)
    .filter(team => teamPositionRanges[team] === minRange);
  
  // In case of a tie, use the team with lowest variance
  if (consistentTeams.length > 1) {
    let minVariance = Infinity;
    let finalConsistentTeam = consistentTeams[0];
    
    for (const team of consistentTeams) {
      if (teamMetrics[team].variance < minVariance) {
        minVariance = teamMetrics[team].variance;
        finalConsistentTeam = team;
      }
    }
    
    stats.mostConsistentTeam = finalConsistentTeam;
  } else {
    stats.mostConsistentTeam = consistentTeams[0];
  }
  stats.consistentRange = minRange;
}
  
  // FAN LOYALTY STATISTICS - with better tiebreaking
if (supportedTeams && Object.keys(supportedTeams).length > 0) {
  const fanLoyalty = {};
  
  for (const [user, team] of Object.entries(supportedTeams)) {
    if (!team || !bets[user]) continue;
    
    const userPredictions = bets[user];
    if (userPredictions.includes(team)) {
      const position = userPredictions.indexOf(team) + 1;
      const consensusPos = Object.keys(sortedStandings).indexOf(team) + 1;
      
      fanLoyalty[user] = {
        team,
        position,
        consensusPos,
        // Calculate bias: negative bias means they ranked their team higher than consensus
        bias: position - consensusPos,
        // Additional factors for tiebreaking
        teamStrength: consensusPos, // Lower is better (higher ranked team)
      };
    }
  }
  
  // Most loyal fan (predicted their team highest compared to consensus)
  if (Object.keys(fanLoyalty).length > 0) {
    // First criterion: lowest position = most loyal
    const mostLoyalPosition = Math.min(...Object.values(fanLoyalty).map(info => info.position));
    const mostLoyalFans = Object.keys(fanLoyalty)
      .filter(user => fanLoyalty[user].position === mostLoyalPosition);
    
    // Tiebreaker: if multiple fans predicted their team at the same position,
    // the one who supports a "worse" team (according to consensus) is more loyal
    if (mostLoyalFans.length > 1) {
      let worstTeamStrength = -1;
      let finalLoyalFan = mostLoyalFans[0];
      
      for (const user of mostLoyalFans) {
        const teamStrength = fanLoyalty[user].teamStrength;
        if (teamStrength > worstTeamStrength) {
          worstTeamStrength = teamStrength;
          finalLoyalFan = user;
        }
      }
      
      stats.mostLoyalFan = finalLoyalFan;
    } else {
      stats.mostLoyalFan = mostLoyalFans[0];
    }
    stats.loyaltyPosition = mostLoyalPosition;
    
    // Biggest traitor (predicted their team lowest)
    const worstPosition = Math.max(...Object.values(fanLoyalty).map(info => info.position));
    const biggestTraitors = Object.keys(fanLoyalty)
      .filter(user => fanLoyalty[user].position === worstPosition);
    
    // Tiebreaker: if multiple "traitors", the one who supports a "better" team is more traitorous
    if (biggestTraitors.length > 1) {
      let bestTeamStrength = Infinity;
      let finalTraitor = biggestTraitors[0];
      
      for (const user of biggestTraitors) {
        const teamStrength = fanLoyalty[user].teamStrength;
        if (teamStrength < bestTeamStrength) {
          bestTeamStrength = teamStrength;
          finalTraitor = user;
        }
      }
      
      stats.mostTreason = finalTraitor;
    } else {
      stats.mostTreason = biggestTraitors[0];
    }
    stats.treasonPosition = worstPosition;
    
    // Most biased fan (biggest negative difference between predicted and consensus)
    const biasValues = Object.entries(fanLoyalty).map(([user, info]) => ({
      user,
      bias: info.bias,
      // Negative bias means they ranked their team higher than consensus
      overrating: -info.bias
    }));
    
    // Find the person who overrated their team the most
    biasValues.sort((a, b) => b.overrating - a.overrating);
    
    if (biasValues.length > 0 && biasValues[0].overrating > 0) {
      stats.mostBiasStat = {
        user: biasValues[0].user,
        positions: biasValues[0].overrating
      };
    }
  }
}
  
  // RIVALRY STATISTICS
  const rivalryData = {};
  const teams = Object.keys(sortedStandings);
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const team1 = teams[i];
      const team2 = teams[j];
      let switchCount = 0;
      
      // Count how many predictors switch these teams in their predictions
      for (const userPredictions of Object.values(bets)) {
        const pos1 = userPredictions.indexOf(team1);
        const pos2 = userPredictions.indexOf(team2);
        
        if (pos1 !== -1 && pos2 !== -1) {
          // Position in consensus vs position in user prediction
          const consensusPos1 = teams.indexOf(team1);
          const consensusPos2 = teams.indexOf(team2);
          
          if ((consensusPos1 < consensusPos2 && pos1 > pos2) || 
              (consensusPos1 > consensusPos2 && pos1 < pos2)) {
            switchCount++;
          }
        }
      }
      
      if (switchCount > 0) {
        rivalryData[`${team1} vs ${team2}`] = switchCount;
      }
    }
  }
  
  if (Object.keys(rivalryData).length > 0) {
    const maxSwitches = Math.max(...Object.values(rivalryData));
    const fiercestRivalries = Object.keys(rivalryData)
      .filter(matchup => rivalryData[matchup] === maxSwitches);
    
    if (fiercestRivalries.length > 0) {
      stats.rivalryStats = {
        teams: formatList(fiercestRivalries),
        description: `${maxSwitches} participants switched their order`
      };
    }
  }
  
  return stats;
};