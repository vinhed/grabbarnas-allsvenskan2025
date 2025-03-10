// src/pages/Dashboard.js
import React, { useState } from 'react';
import StatsCards from '../components/StatsCard';
import FunStats from '../components/FunStats';
import ConsensusStandingsTable from '../components/ConsensusStandingsTable';
import PredictionsTable from '../components/PredictionsTable';
import EnhancedPredictionTracker from '../components/EnhancedPredictionTracker';
import SupporterTeamSection from '../components/SupporterTeamSection'; 

const Dashboard = ({ 
  bets, 
  supportedTeams,
  currentStandings, 
  sortedConsensusRankings, 
  funStats, 
  teamLogos,
  apiData
}) => {
  // State for view options
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  
  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <StatsCards 
        bets={bets} 
        consensusRankings={sortedConsensusRankings} 
        supportedTeams={supportedTeams}
      />
      
      <EnhancedPredictionTracker 
        currentStandings={currentStandings} 
        bets={bets} 
        supportedTeams={supportedTeams}
        teamLogos={teamLogos}
        apiData={apiData}
      />
      
      {/* Fun Statistics */}
      <FunStats 
        stats={funStats} 
        supportedTeams={supportedTeams}
        teamLogos={teamLogos}
      />
      
      {/* Enhanced Consensus Standings */}
      <ConsensusStandingsTable 
        consensusRankings={sortedConsensusRankings} 
        bets={bets} 
        teamLogos={teamLogos} 
      />
      
      {/* Individual Predictions */}
      <PredictionsTable 
        bets={bets} 
        supportedTeams={supportedTeams}
        teamLogos={teamLogos} 
      />
    </div>
  );
};

export default Dashboard;