// src/components/FunStats.js
import React from 'react';

const FunStats = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <section className="compact-fun-stats-section">
        <h2 className="section-title statistics-title"><span className="icon">🎮</span> Statistics</h2>
        <p>No statistics available yet.</p>
      </section>
    );
  }

  // Create an array of stat cards with their data
  const statCards = [
    stats.mostPredictedChampion && {
      title: "People's Champion",
      value: stats.mostPredictedChampion,
      description: `Most frequently predicted to win with ${stats.championVotes} votes`,
      icon: "🥇"
    },
    stats.mostPredictedRelegation && {
      title: "Relegation Favorite",
      value: stats.mostPredictedRelegation,
      description: `Most frequently predicted for relegation with ${stats.relegationVotes} votes`,
      icon: "⬇️"
    },
    stats.mostPredictedPlayoff && {
      title: "Playoff Candidate",
      value: stats.mostPredictedPlayoff,
      description: `Most frequently predicted for relegation playoff with ${stats.playoffVotes} votes`,
      icon: "🎯"
    },
    stats.mostDivisiveTeam && {
      title: "Most Divisive Team",
      value: stats.mostDivisiveTeam,
      description: `Highest variance in predicted positions (${stats.divisiveVariance})`,
      icon: "🔥"
    },
    stats.mostAgreedTeam && {
      title: "Most Agreed Team",
      value: stats.mostAgreedTeam,
      description: `Lowest variance in predicted positions (${stats.agreedVariance})`,
      icon: "🤝"
    },
    stats.mostOptimistic && {
      title: "The Optimist",
      value: stats.mostOptimistic,
      description: "Ranks top teams higher than others",
      icon: "😊"
    },
    stats.mostPessimistic && {
      title: "The Pessimist",
      value: stats.mostPessimistic,
      description: "Ranks top teams lower than others",
      icon: "😔"
    },
    stats.mostUnique && {
      title: "The Maverick",
      value: stats.mostUnique,
      description: "Most predictions different from the consensus",
      icon: "🦄"
    },
    stats.prophet && {
      title: "The Prophet",
      value: stats.prophet,
      description: "Predictions most aligned with the group consensus",
      icon: "🔮"
    }
  ].filter(Boolean); // Remove any undefined entries

  return (
    <section className="compact-fun-stats-section">
      <h2 className="section-title statistics-title"><span className="icon">🎮</span> Statistics</h2>
      
      <div className="fun-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="compact-fun-stat-card">
            <div className="fun-stat-icon">{stat.icon}</div>
            <div className="fun-stat-content">
              <div className="fun-stat-title">{stat.title}</div>
              <div className="fun-stat-value">{stat.value}</div>
              <div className="fun-stat-description">{stat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FunStats;