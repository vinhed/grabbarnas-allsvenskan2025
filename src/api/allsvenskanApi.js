// src/api/allsvenskanApi.js

// Cache object to store API responses
const cache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 60 * 1000 // 1 minute in milliseconds
};

// Function to check if cache is valid
const isCacheValid = () => {
  return (
    cache.data !== null && 
    cache.timestamp !== null && 
    (new Date().getTime() - cache.timestamp) < cache.CACHE_DURATION
  );
};

// Function to fetch full data from API
export const fetchFullData = async () => {
  try {
    // Check if we have valid cached data
    if (isCacheValid()) {
      console.log("Using cached data");
      return cache.data;
    }

    console.log("Fetching fresh data");
    let apiResponse;

    try {
      apiResponse = await fetch(`https://xoskkowgwcogcs0084ws4scg.coolify.s1219.com/api/allsvenskan/standings?nocache=${new Date().getTime()}`);

      if (!apiResponse.ok) {
        apiResponse = await fetch(`https://allsvenskan-proxy.onrender.com/api/allsvenskan/standings?nocache=${new Date().getTime()}`);
      }
      
      if (!apiResponse.ok) {
        apiResponse = await fetch(`https://raw.githubusercontent.com/vinhed/grabbarnas-allsvenskan2025/refs/heads/main/public/data/standings.json?nocache=${new Date().getTime()}`);
      }

      if (!apiResponse.ok) {
        throw new Error(`Failed to fetch data: ${apiResponse.status}`);
      }

      // Parse the response
      const data = await apiResponse.json();
      
      // Update the cache
      cache.data = data;
      cache.timestamp = new Date().getTime();
      
      return data;
    } catch (fetchError) {
      console.warn("Could not load data, using mock data:", fetchError);
      return {};
    }
  } catch (error) {
    console.error("Error fetching Allsvenskan API data:", error);
    return null;
  }
};

// Function to fetch and process Allsvenskan standings
export const fetchAllsvenskanStandings = async () => {
  try {
    const data = await fetchFullData();
    
    if (!data) {
      return [];
    }
    
    // Process the data to extract standings
    const standingsData = [];
    
    // Process each team entry (ignoring the 'undefined' key)
    for (const key in data) {
      // Skip the 'undefined' key and any non-numeric keys
      if (!key.match(/^\d+$/)) {
        continue;
      }
      
      const teamInfo = data[key];
      
      // Extract team information
      const position = parseInt(teamInfo.position || 0);
      const teamName = teamInfo.name || '';
      const displayName = teamInfo.displayName || teamName;
      const logoUrl = teamInfo.logoImageUrl || '';
      
      // Get stats
      const stats = {};
      if (teamInfo.stats && Array.isArray(teamInfo.stats)) {
        for (const stat of teamInfo.stats) {
          const statName = stat.name || '';
          const statValue = stat.value || 0;
          stats[statName] = statValue;
        }
      }
      
      // Add team to list
      standingsData.push({
        position,
        name: teamName,
        displayName,
        logoUrl,
        stats
      });
    }
    
    // Sort by position
    standingsData.sort((a, b) => a.position - b.position);
    
    // Store the full data for later use
    fetchAllsvenskanStandings.fullData = standingsData;
    
    // Extract just the team names for compatibility with existing code
    return standingsData.map(team => team.displayName);
    
  } catch (error) {
    console.error("Error processing Allsvenskan standings:", error);
    return [];
  }
};

// Function to calculate prediction scores based on actual standings
export const calculatePredictionScores = (bets, actualResults) => {
  const scores = {};
  const teamCount = actualResults.length;
  
  if (teamCount === 0) {
    return scores;
  }
  
  // Calculate the theoretical maximum error possible
  // Worst case: predicting teams in completely reverse order
  const maxPossibleError = 
    teamCount % 2 === 0 
      ? (teamCount * teamCount) / 2 
      : ((teamCount * teamCount) - 1) / 2;
  
  for (const [user, predictions] of Object.entries(bets)) {
    let totalError = 0;
    const userTeamErrors = {};
    
    for (let i = 0; i < predictions.length; i++) {
      const team = predictions[i];
      
      // Skip if the team isn't in actual results
      if (!actualResults.includes(team)) {
        continue;
      }
      
      // Get actual position (0-indexed in the list)
      const actualPos = actualResults.indexOf(team);
      
      // Calculate absolute error for this team
      const error = Math.abs(i - actualPos);
      totalError += error;
      
      userTeamErrors[team] = {
        predicted: i + 1,  // +1 for display position
        actual: actualPos + 1,  // +1 for display position
        error
      };
    }
    
    // Find best and worst predictions
    let bestPrediction = null;
    let worstPrediction = null;
    
    if (Object.keys(userTeamErrors).length > 0) {
      // Find team with minimum error
      let minError = Infinity;
      let minTeam = null;
      
      // Find team with maximum error
      let maxError = -1;
      let maxTeam = null;
      
      for (const [team, data] of Object.entries(userTeamErrors)) {
        if (data.error < minError) {
          minError = data.error;
          minTeam = team;
        }
        
        if (data.error > maxError) {
          maxError = data.error;
          maxTeam = team;
        }
      }
      
      if (minTeam) {
        bestPrediction = [minTeam, userTeamErrors[minTeam]];
      }
      
      if (maxTeam) {
        worstPrediction = [maxTeam, userTeamErrors[maxTeam]];
      }
    }
    
    // Convert error to a positive score (higher is better)
    const positiveScore = maxPossibleError - totalError;
    
    scores[user] = {
      score: positiveScore,
      maxPossible: maxPossibleError,
      rawError: totalError,
      percent: Math.round((positiveScore / maxPossibleError) * 100 * 10) / 10,
      bestPrediction,
      worstPrediction
    };
  }
  
  return scores;
};

// Function to get sorted leaderboard from scores
export const getLeaderboard = (scores) => {
  return Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([user, data]) => ({ user, ...data }));
};