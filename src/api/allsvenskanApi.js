// src/api/allsvenskanApi.js

// Function to fetch full data from API
export const fetchFullData = async () => {
  try {
    // Try the real API first
    const url = "https://allsvenskan.se/data-endpoint/statistics/standings/2025/total";
    
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache"
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, { 
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      console.warn('API request failed, falling back to local data', fetchError);
      // Fall back to local mock file
      const localResponse = await fetch('/data/standings.json');
      return await localResponse.json();
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