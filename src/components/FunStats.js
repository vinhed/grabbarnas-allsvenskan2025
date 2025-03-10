import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

const FunStats = ({ stats, supportedTeams, teamLogos }) => {
  const [activeCategory, setActiveCategory] = useState('favorites');
  
  // Initialize team colors directly to avoid async issues
  const [teamColors] = useState({
    'AIK': { primary: '#FFD700', secondary: '#FFFFFF' },           // Gold instead of black
    'Djurgården': { primary: '#4B85D6', secondary: '#C60C30' },    // Brighter blue
    'Hammarby': { primary: '#1FD672', secondary: '#FFFFFF' },      // Bright green
    'Malmö FF': { primary: '#3BBDFF', secondary: '#FFFFFF' },      // Bright blue
    'IFK Göteborg': { primary: '#3E9AFF', secondary: '#FFFFFF' },  // Bright blue
    'BK Häcken': { primary: '#FFEC00', secondary: '#D9D9D9' },     // Yellow
    'IF Elfsborg': { primary: '#FFEC00', secondary: '#D9D9D9' },   // Yellow
    'IFK Norrköping': { primary: '#3BBDFF', secondary: '#FFFFFF' },// Bright blue
    'IFK Värnamo': { primary: '#4C9EFF', secondary: '#FFFFFF' },   // Bright blue
    'IK Sirius': { primary: '#4C9EFF', secondary: '#FFFFFF' },     // Bright blue
    'Mjällby AIF': { primary: '#FFEC00', secondary: '#D9D9D9' },   // Yellow
    'BP': { primary: '#FF5252', secondary: '#FFFFFF' },            // Bright red
    'Degerfors IF': { primary: '#FF5252', secondary: '#FFFFFF' },  // Bright red
    'Halmstads BK': { primary: '#4C9EFF', secondary: '#FFFFFF' },  // Bright blue
    'GAIS': { primary: '#20B473', secondary: '#FFFFFF' },          // Bright green
    'Östers IF': { primary: '#FF5252', secondary: '#FFFFFF' },     // Bright red
    // Fallback for teams not explicitly defined
    'default': { primary: '#3a86ff', secondary: '#f0f0f0' }
  });

  // Helper function to get team color or fallback to default
  const getTeamColor = (teamName, isPrimary = true) => {
    if (!teamName) return isPrimary ? '#3a86ff' : '#f0f0f0';
    
    try {
      // Handle multiple teams separated by commas or ampersands
      if (teamName.includes(',') || teamName.includes('&')) {
        const teams = teamName.split(/,\s*|\s*&\s*/);
        const firstTeam = teams[0].trim();
        return getTeamColorForSingleTeam(firstTeam, isPrimary);
      }
      
      return getTeamColorForSingleTeam(teamName, isPrimary);
    } catch (error) {
      console.error("Error getting team color for:", teamName, error);
      return isPrimary ? '#3a86ff' : '#f0f0f0';
    }
  };
  
  const getTeamColorForSingleTeam = (teamName, isPrimary) => {
    if (!teamName) return isPrimary ? '#3a86ff' : '#f0f0f0';
    
    // First try exact match
    if (teamColors && teamColors[teamName]) {
      return isPrimary ? teamColors[teamName].primary : teamColors[teamName].secondary;
    }
    
    // Then try partial match
    if (teamColors) {
      const team = Object.keys(teamColors).find(
        key => {
          if (!key || key === 'default') return false;
          return teamName.toLowerCase().includes(key.toLowerCase()) || 
                key.toLowerCase().includes(teamName.toLowerCase());
        }
      );
      
      if (team && teamColors[team]) {
        return isPrimary ? teamColors[team].primary : teamColors[team].secondary;
      }
    }
    
    // Return default if no match found
    return isPrimary ? '#3a86ff' : '#f0f0f0';
  };
  
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <section className="compact-fun-stats-section">
        <h2 className="section-title statistics-title"><span className="icon">🎮</span> Statistics</h2>
        <p>No statistics available yet.</p>
      </section>
    );
  }
  
  // Helper to display hometown bias as a vertical list
  const displayHometownBias = (biasLevel, avgPosition) => {
    const biasColors = {
      "High": "var(--accent)",
      "Moderate": "var(--accent2)",
      "Low": "var(--accent3)"
    };
    
    const biasInfo = [
      { label: "Bias Level", value: biasLevel, color: biasColors[biasLevel] || "var(--text-primary)" },
      { label: "Average Position", value: avgPosition, color: "var(--text-primary)" }
    ];
    
    return (
      <div className="vertical-info-list">
        {biasInfo.map((item, index) => (
          <div key={index} className="vertical-info-item" style={{ borderLeftColor: item.color }}>
            <div className="info-label">{item.label}:</div>
            <div className="info-value" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to display rivalry data with unique team colors
  const displayRivalry = (rivalryString, description) => {
    if (!rivalryString) return null;
    
    const teams = rivalryString.split(/,\s*|\s*&\s*/);
    
    return (
      <div className="vertical-info-list">
        <div className="vertical-info-item rivalry-teams">
          <div className="rivalry-teams-container">
            {teams.map((team, index) => {
              const trimmedTeam = team.trim();
              const teamColor = getTeamColor(trimmedTeam);
              const teams = trimmedTeam.split(" vs ");
              
              return (
                <React.Fragment key={index}>
                  <div 
                    className="team-with-logo rivalry-team" 
                    style={{ 
                      borderLeft: `3px solid ${teamColor}`,
                      backgroundColor: `${teamColor}20`,
                      margin: "3px",
                      padding: "5px 10px",
                      borderRadius: "4px"
                    }}
                  >
                    <TeamLogo team={teams[0]} logoUrl={teamLogos[teams[0]]} size="normal" />
                    <div className="rivalry-vs">vs</div>
                    <TeamLogo team={teams[1]} logoUrl={teamLogos[teams[1]]} size="normal" />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper to display multiple people with their supported teams and team colors
  const displayMultiplePeople = (peopleString) => {
    if (!peopleString) return null;
    
    const names = peopleString.split(/,\s*|\s*&\s*/);
    
    return (
      <div className="vertical-people-list">
        {names.map((name, index) => {
          const trimmedName = name.trim();
          const team = supportedTeams && supportedTeams[trimmedName];
          const teamColor = team ? getTeamColor(team) : 'var(--accent)';
          
          return (
            <div 
              key={index} 
              className="vertical-person-item" 
              style={{ 
                borderLeft: `3px solid ${teamColor}`,
                backgroundColor: `${teamColor}20`, // 20 = 12.5% opacity
                display: "flex",
                alignItems: "center"
              }}
            >
              <div className="person-with-team" style={{ display: "flex", alignItems: "center" }}>
                {team && teamLogos[team] && (
                  <TeamLogo team={team} logoUrl={teamLogos[team]} size="normal" />
                )}
                <span style={{ 
                  color: teamColor, 
                  fontWeight: "600" 
                }}>{trimmedName}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Calculate bias statistics for supported teams
  const calculateBias = () => {
    if (!supportedTeams || Object.keys(supportedTeams).length === 0) {
      return null;
    }
    
    // Find average position of supported teams
    let totalPositions = 0;
    let count = 0;
    
    Object.entries(supportedTeams).forEach(([user, team]) => {
      if (!team) return;
      
      const userPredictions = stats.userPredictions?.[user];
      if (userPredictions && userPredictions.includes(team)) {
        const position = userPredictions.indexOf(team) + 1;
        totalPositions += position;
        count++;
      }
    });
    
    if (count === 0) return null;
    
    const avgPosition = (totalPositions / count).toFixed(1);
    const biasLevel = count > 0 && avgPosition < 5 ? "High" : avgPosition < 10 ? "Moderate" : "Low";
    
    return {
      avgPosition,
      biasLevel
    };
  };
  
  // Create a mapping between team names and their normalized versions
  const normalizeTeamName = (teamName) => {
    if (!teamName) return '';
    
    // Common mappings for Allsvenskan teams
    const mappings = {
      'AIK': 'AIK',
      'Djurgården': 'Djurgårdens IF',
      'Djurgårdens': 'Djurgårdens IF',
      'DIF': 'Djurgårdens IF',
      'Hammarby': 'Hammarby IF',
      'Bajen': 'Hammarby IF',
      'Malmö': 'Malmö FF',
      'Malmö FF': 'Malmö FF',
      'MFF': 'Malmö FF',
      'IFK Göteborg': 'IFK Göteborg',
      'Göteborg': 'IFK Göteborg',
      'Blåvitt': 'IFK Göteborg',
      'BK Häcken': 'BK Häcken',
      'Häcken': 'BK Häcken',
      'Elfsborg': 'IF Elfsborg',
      'IF Elfsborg': 'IF Elfsborg',
      'IFK Norrköping': 'IFK Norrköping',
      'Norrköping': 'IFK Norrköping',
      'Peking': 'IFK Norrköping',
      'IFK Värnamo': 'IFK Värnamo',
      'Värnamo': 'IFK Värnamo',
      'IK Sirius': 'IK Sirius',
      'Sirius': 'IK Sirius',
      'Mjällby AIF': 'Mjällby AIF',
      'Mjällby': 'Mjällby AIF',
      'BP': 'IF Brommapojkarna',
      'Brommapojkarna': 'IF Brommapojkarna',
      'Degerfors IF': 'Degerfors IF',
      'Degerfors': 'Degerfors IF',
      'Halmstads BK': 'Halmstads BK',
      'Halmstad': 'Halmstads BK',
      'HBK': 'Halmstads BK',
      'GAIS': 'GAIS',
      'Gais': 'GAIS',
      'Östers IF': 'Östers IF',
      'Öster': 'Östers IF'
    };
    
    // Try direct lookup first
    if (mappings[teamName]) {
      return mappings[teamName];
    }
    
    // Try case-insensitive match
    const lowerTeamName = teamName.toLowerCase();
    for (const [key, value] of Object.entries(mappings)) {
      if (key.toLowerCase() === lowerTeamName) {
        return value;
      }
    }
    
    // Return original if no match found
    return teamName;
  };
  
  // Helper to safely get team logo URL with fallback
  const getTeamLogo = (team) => {
    if (!team || !teamLogos) return null;
    
    // Try direct lookup first
    if (teamLogos[team]) {
      return teamLogos[team];
    }
    
    // Try with normalized team name
    const normalizedTeam = normalizeTeamName(team);
    if (teamLogos[normalizedTeam]) {
      return teamLogos[normalizedTeam];
    }
    
    // Try partial match
    for (const [logoTeam, logoUrl] of Object.entries(teamLogos)) {
      // Skip empty entries
      if (!logoTeam) continue;
      
      // Check if either name contains the other
      if (logoTeam.toLowerCase().includes(team.toLowerCase()) || 
          team.toLowerCase().includes(logoTeam.toLowerCase())) {
        return logoUrl;
      }
    }
    
    return null;
  };
  
  // Helper to display multiple teams with each team's appropriate colors
  const displayMultipleTeams = (teamsString) => {
    if (!teamsString) return null;
    
    const teams = teamsString.split(/,\s*|\s*&\s*/);
    
    return (
      <div className="vertical-teams-list">
        {teams.map((team, index) => {
          const trimmedTeam = team.trim();
          const teamColor = getTeamColor(trimmedTeam);
          const logo = getTeamLogo(trimmedTeam);
          
          return (
            <div 
              key={index} 
              className="vertical-team-item" 
              style={{ 
                borderLeft: `3px solid ${teamColor}`,
                backgroundColor: `${teamColor}20` // 20 = 12.5% opacity
              }}
            >
              <div className="team-with-logo">
                <TeamLogo team={trimmedTeam} logoUrl={logo} size="normal" />
                <span style={{ color: teamColor }}>{trimmedTeam}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const fanBias = calculateBias();
  
  // Define categories with their stats
  const statCategories = {
    favorites: [
      stats.mostPredictedChampion && {
        title: "People's Champion",
        value: displayMultipleTeams(stats.mostPredictedChampion),
        rawValue: stats.mostPredictedChampion,
        description: `Most frequently predicted to win with ${stats.championVotes} votes`,
        icon: "🥇",
        color: getTeamColor(stats.mostPredictedChampion)
      },
      stats.mostPredictedRelegation && {
        title: "Relegation Favorite",
        value: displayMultipleTeams(stats.mostPredictedRelegation),
        rawValue: stats.mostPredictedRelegation,
        description: `Most frequently predicted for relegation with ${stats.relegationVotes} votes`,
        icon: "⬇️",
        color: getTeamColor(stats.mostPredictedRelegation)
      },
      stats.mostPredictedPlayoff && {
        title: "Playoff Candidate",
        value: displayMultipleTeams(stats.mostPredictedPlayoff),
        rawValue: stats.mostPredictedPlayoff,
        description: `Most frequently predicted for relegation playoff with ${stats.playoffVotes} votes`,
        icon: "🎯",
        color: getTeamColor(stats.mostPredictedPlayoff)
      }
    ].filter(Boolean),
    
    teams: [
      stats.mostDivisiveTeam && {
        title: "Most Divisive Team",
        value: displayMultipleTeams(stats.mostDivisiveTeam),
        rawValue: stats.mostDivisiveTeam,
        description: `Highest variance in predicted positions (${stats.divisiveVariance})`,
        icon: "🔥",
        color: getTeamColor(stats.mostDivisiveTeam)
      },
      stats.mostAgreedTeam && {
        title: "Most Agreed Team",
        value: displayMultipleTeams(stats.mostAgreedTeam),
        rawValue: stats.mostAgreedTeam,
        description: `Lowest variance in predicted positions (${stats.agreedVariance})`,
        icon: "🤝",
        color: getTeamColor(stats.mostAgreedTeam)
      },
      stats.biggestDarkHorse && {
        title: "Most Overrated",
        value: displayMultipleTeams(stats.biggestDarkHorse),
        rawValue: stats.biggestDarkHorse,
        description: `Predicted ${stats.darkHorseValue} positions higher than consensus`,
        icon: "🐎",
        color: getTeamColor(stats.biggestDarkHorse)
      },
      stats.mostUnderrated && {
        title: "Most Underrated",
        value: displayMultipleTeams(stats.mostUnderrated),
        rawValue: stats.mostUnderrated,
        description: `Consensus ${stats.underratedValue} positions lower than average prediction`,
        icon: "⭐",
        color: getTeamColor(stats.mostUnderrated)
      },
      stats.mostPolarizingTeam && {
        title: "Most Polarizing",
        value: displayMultipleTeams(stats.mostPolarizingTeam),
        rawValue: stats.mostPolarizingTeam,
        description: `Predicted between ${stats.polarizingRange} positions`,
        icon: "⚡",
        color: getTeamColor(stats.mostPolarizingTeam)
      },
      stats.mostConsistentTeam && {
        title: "Most Consistent",
        value: displayMultipleTeams(stats.mostConsistentTeam),
        rawValue: stats.mostConsistentTeam,
        description: `Narrowest prediction range (±${stats.consistentRange} positions)`,
        icon: "📏",
        color: getTeamColor(stats.mostConsistentTeam)
      }
    ].filter(Boolean),
    
    predictors: [
      stats.mostOptimistic && {
        title: "The Optimist",
        value: displayMultiplePeople(stats.mostOptimistic),
        rawValue: stats.mostOptimistic,
        description: "Ranks top teams higher than others",
        icon: "😊",
        color: "var(--accent)"
      },
      stats.mostPessimistic && {
        title: "The Pessimist",
        value: displayMultiplePeople(stats.mostPessimistic),
        rawValue: stats.mostPessimistic,
        description: "Ranks top teams lower than others",
        icon: "😔",
        color: "var(--accent2)"
      },
      stats.mostUnique && {
        title: "The Maverick",
        value: displayMultiplePeople(stats.mostUnique),
        rawValue: stats.mostUnique,
        description: "Most predictions different from the consensus",
        icon: "🦄",
        color: "var(--accent3)"
      },
      stats.prophet && {
        title: "The Prophet",
        value: displayMultiplePeople(stats.prophet),
        rawValue: stats.prophet,
        description: "Predictions most aligned with the group consensus",
        icon: "🔮",
        color: "#f72585"
      },
      stats.mostLoyalFan && {
        title: "Hometown Hero",
        value: displayMultiplePeople(stats.mostLoyalFan),
        rawValue: stats.mostLoyalFan,
        description: `Predicted their supported team the highest (${stats.loyaltyPosition}) and rivals lowest`,
        icon: "💪",
        color: "#4361ee"
      },
      stats.mostTreason && {
        title: "The Traitor",
        value: displayMultiplePeople(stats.mostTreason),
        rawValue: stats.mostTreason,
        description: `Predicted their supported team the lowest (${stats.treasonPosition})`,
        icon: "🗡️",
        color: "#4cc9f0"
      }
    ].filter(Boolean),
    
    funFacts: [
      fanBias && {
        title: "Hometown Bias",
        value: displayHometownBias(fanBias.biasLevel, fanBias.avgPosition),
        rawValue: fanBias.biasLevel,
        description: "How fans rank their own supported teams",
        icon: "💙",
        color: "var(--accent)"
      },
      stats.rivalryStats && {
        title: "Position Swaps",
        value: displayRivalry(stats.rivalryStats.teams, stats.rivalryStats.description),
        rawValue: stats.rivalryStats.teams,
        description: "Teams with most position switches",
        icon: "⚔️",
        color: getTeamColor(stats.rivalryStats.teams?.split(/,\s*|\s*&\s*/)[0]?.trim())
      },
      stats.mostBiasStat && {
        title: "Most Biased Fan",
        value: displayMultiplePeople(stats.mostBiasStat?.user),
        rawValue: stats.mostBiasStat?.user,
        description: `Overrated their team by ${stats.mostBiasStat?.positions} positions`,
        icon: "🔍",
        color: "var(--accent3)"
      }
    ].filter(Boolean)
  };

  return (
    <section className="compact-fun-stats-section">
      <h2 className="section-title statistics-title"><span className="icon">🎮</span> Statistics</h2>
      
      {/* Category Tabs */}
      <div className="stats-category-tabs">
        <button 
          className={`stats-tab ${activeCategory === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveCategory('favorites')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">Favorites</span>
        </button>
        <button 
          className={`stats-tab ${activeCategory === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveCategory('teams')}
        >
          <span className="tab-icon">⚽</span>
          <span className="tab-text">Teams</span>
        </button>
        <button 
          className={`stats-tab ${activeCategory === 'predictors' ? 'active' : ''}`}
          onClick={() => setActiveCategory('predictors')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-text">Predictors</span>
        </button>
        <button 
          className={`stats-tab ${activeCategory === 'funFacts' ? 'active' : ''}`}
          onClick={() => setActiveCategory('funFacts')}
        >
          <span className="tab-icon">🎪</span>
          <span className="tab-text">Fun Facts</span>
        </button>
      </div>
      
      <div className="fun-stats-grid">
        {statCategories[activeCategory]?.map((stat, index) => {
          return (
            <div 
              key={index} 
              className="compact-fun-stat-card" 
              style={{ 
                borderLeftColor: stat.color,
                background: `linear-gradient(135deg, var(--bg-tertiary) 0%, ${stat.color}10 100%)` 
              }}
            >
              <div className="fun-stat-icon">{stat.icon}</div>
              <div className="fun-stat-content">
                <div className="fun-stat-title">{stat.title}</div>
                <div className="fun-stat-value" style={{ color: stat.color }}>
                  {stat.value || stat.rawValue}
                </div>
                <div className="fun-stat-description">{stat.description}</div>
              </div>
            </div>
          );
        })}
        
        {(!statCategories[activeCategory] || statCategories[activeCategory].length === 0) && (
          <div className="no-stats-message">
            No statistics available for this category yet.
          </div>
        )}
      </div>
      
      {/* Add custom styling for team-specific elements */}
      <style jsx>{`
        .vertical-team-item:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .rivalry-team {
          transition: transform 0.2s ease;
        }
        
        .rivalry-team:hover {
          transform: translateY(-2px);
        }
        
        .vertical-person-item:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </section>
  );
};

export default FunStats;