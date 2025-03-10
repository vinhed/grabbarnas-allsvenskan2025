// src/pages/Dashboard.js
import React from 'react';
import StatsCards from '../components/StatsCard';
import FunStats from '../components/FunStats';
import ConsensusStandingsTable from '../components/ConsensusStandingsTable';
import PredictionsTable from '../components/PredictionsTable';
import LiveStandingsTable from '../components/LiveStandingsTable';

const Dashboard = ({ 
  bets, 
  currentStandings, 
  sortedConsensusRankings, 
  funStats, 
  teamLogos,
  apiData
}) => {
  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <StatsCards bets={bets} consensusRankings={sortedConsensusRankings} />
      
      {/* Fun Statistics */}
      <FunStats stats={funStats} />

      {/* Live Standings Table (shown only if data available) */}
      <LiveStandingsTable 
        currentStandings={currentStandings} 
        bets={bets} 
        apiData={apiData}
      />
      
      {/* Enhanced Consensus Standings */}
      <ConsensusStandingsTable 
        consensusRankings={sortedConsensusRankings} 
        bets={bets} 
        teamLogos={teamLogos} 
      />
      
      {/* Individual Predictions */}
      <PredictionsTable bets={bets} teamLogos={teamLogos} />
    </div>
  );
};

export default Dashboard;