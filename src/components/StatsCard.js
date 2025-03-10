// src/components/StatsCards.js
import React from 'react';

const StatsCards = ({ bets, consensusRankings }) => {
  return (
    <div className="compact-stats-container">
      <div className="compact-stat-item">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <div className="stat-value">{Object.keys(bets).length}</div>
          <div className="stat-label">Participants</div>
        </div>
      </div>
      <div className="compact-stat-item">
        <div className="stat-icon">🏆</div>
        <div className="stat-content">
          <div className="stat-value">{Object.keys(consensusRankings).length}</div>
          <div className="stat-label">Teams</div>
        </div>
      </div>
      <div className="compact-stat-item">
        <div className="stat-icon">⭐</div>
        <div className="stat-content">
          <div className="stat-value">
            {Object.keys(consensusRankings)[0] || 'N/A'}
          </div>
          <div className="stat-label">Favorite</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;