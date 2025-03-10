// src/components/FunStats.js
import React from 'react';

const FunStats = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <section className="fun-stats-section">
        <h2 className="section-title"><span className="icon">🎮</span> Statistics</h2>
        <p>No statistics available yet.</p>
      </section>
    );
  }

  return (
    <section className="fun-stats-section">
      <h2 className="section-title"><span className="icon">🎮</span> Statistics</h2>
      
      <div className="fun-stats-grid">
        {stats.mostPredictedChampion && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">People's Champion</div>
            <div className="fun-stat-value">{stats.mostPredictedChampion}</div>
            <div className="fun-stat-description">
              Most frequently predicted to win with {stats.championVotes} votes
            </div>
          </div>
        )}
        
        {stats.mostPredictedRelegation && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">Direct Relegation Favorite</div>
            <div className="fun-stat-value">{stats.mostPredictedRelegation}</div>
            <div className="fun-stat-description">
              Most frequently predicted for direct relegation (bottom 2) with {stats.relegationVotes} votes
            </div>
          </div>
        )}
        
        {stats.mostPredictedPlayoff && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">Playoff Candidate</div>
            <div className="fun-stat-value">{stats.mostPredictedPlayoff}</div>
            <div className="fun-stat-description">
              Most frequently predicted for relegation playoff (14th place) with {stats.playoffVotes} votes
            </div>
          </div>
        )}
        
        {stats.mostDivisiveTeam && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">Most Divisive Team</div>
            <div className="fun-stat-value">{stats.mostDivisiveTeam}</div>
            <div className="fun-stat-description">
              Highest variance in predicted positions (variance: {stats.divisiveVariance})
            </div>
          </div>
        )}
        
        {stats.mostAgreedTeam && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">Most Agreed Upon Team</div>
            <div className="fun-stat-value">{stats.mostAgreedTeam}</div>
            <div className="fun-stat-description">
              Lowest variance in predicted positions (variance: {stats.agreedVariance})
            </div>
          </div>
        )}
        
        {stats.mostOptimistic && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Optimist</div>
            <div className="fun-stat-value">{stats.mostOptimistic}</div>
            <div className="fun-stat-description">Ranks top teams higher than others</div>
          </div>
        )}
        
        {stats.mostPessimistic && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Pessimist</div>
            <div className="fun-stat-value">{stats.mostPessimistic}</div>
            <div className="fun-stat-description">Ranks top teams lower than others</div>
          </div>
        )}
        
        {stats.mostUnique && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Maverick</div>
            <div className="fun-stat-value">{stats.mostUnique}</div>
            <div className="fun-stat-description">Most predictions different from the consensus</div>
          </div>
        )}
        
        {stats.prophet && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Prophet</div>
            <div className="fun-stat-value">{stats.prophet}</div>
            <div className="fun-stat-description">Predictions most aligned with the group consensus</div>
          </div>
        )}
        
        {stats.biggestDarkHorse && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Dark Horse</div>
            <div className="fun-stat-value">{stats.biggestDarkHorse}</div>
            <div className="fun-stat-description">
              Predicted better than consensus ranking by {stats.darkHorseValue} positions
            </div>
          </div>
        )}
        
        {stats.mostUnderrated && (
          <div className="fun-stat-card">
            <div className="fun-stat-title">The Underrated Team</div>
            <div className="fun-stat-value">{stats.mostUnderrated}</div>
            <div className="fun-stat-description">
              Consensus ranks higher than predictions by {stats.underratedValue} positions
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FunStats;