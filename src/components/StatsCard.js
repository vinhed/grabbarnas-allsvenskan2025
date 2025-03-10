// src/components/StatsCards.js
import React from 'react';

const StatsCards = ({ bets, consensusRankings }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{Object.keys(bets).length}</div>
        <div className="stat-label">Participants</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{Object.keys(consensusRankings).length}</div>
        <div className="stat-label">Teams</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">
          {Object.keys(consensusRankings)[0] || 'N/A'}
        </div>
        <div className="stat-label">Current Favorite</div>
      </div>
    </div>
  );
};

export default StatsCards;