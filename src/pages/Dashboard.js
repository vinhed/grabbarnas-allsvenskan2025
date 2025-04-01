// src/pages/Dashboard.js - Updated to include AllsvenskanStandingsTable
import React, { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCard';
import FunStats from '../components/FunStats';
import ConsensusStandingsTable from '../components/ConsensusStandingsTable';
import PredictionsTable from '../components/PredictionsTable';
import EnhancedPredictionTracker from '../components/EnhancedPredictionTracker';
import MobileDashboard from '../components/MobileDashboard';
import MobileOptimizedTable from '../components/MobileOptimizedTable';
import PerformanceAnalysisTable from '../components/PerformanceAnalysisTable';
import AllsvenskanStandingsTable from '../components/AllsvenskanStandingsTable'; // Import the new component
import '../components/MobileOptimizedTable.css';
import '../components/MobileDashboard.css';

const Dashboard = ({ 
  bets, 
  supportedTeams,
  currentStandings, 
  sortedConsensusRankings, 
  funStats, 
  teamLogos,
  apiData,
  isMobile
}) => {
  // State for view options
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [useMobileTable, setUseMobileTable] = useState(false);
  
  // Check if we should use mobile optimized tables
  useEffect(() => {
    const checkMobileTable = () => {
      setUseMobileTable(window.innerWidth <= 576);
    };
    
    checkMobileTable();
    window.addEventListener('resize', checkMobileTable);
    
    return () => {
      window.removeEventListener('resize', checkMobileTable);
    };
  }, []);
  
  // Prepare data for mobile optimized tables if needed
  const prepareStandingsData = () => {
    if (!sortedConsensusRankings) return [];
    
    return Object.entries(sortedConsensusRankings).map(([team, value], index) => {
      const position = index + 1;
      return {
        position,
        team,
        value
      };
    });
  };
  
  // Columns definition for standings table
  const standingsColumns = [
    { key: 'position', label: '#' },
    { key: 'team', label: 'Team' },
    { key: 'value', label: 'Score' },
  ];
  
  // Function to determine row class for standings
  const getStandingsRowClass = (row, index) => {
    const position = row.position;
    const teamCount = Object.keys(sortedConsensusRankings).length;
    
    if (position === 1) {
      return "europaleague";
    } else if (position === 2 || position === 3) {
      return "conference-league";
    } else if (position >= teamCount - 1) {
      return "relegation-direct";
    } else if (position === teamCount - 2) {
      return "relegation-playoff";
    }
    
    return "";
  };
  
  return (
    <div className="dashboard">
      {/* Mobile Dashboard - only shown on mobile */}
      <MobileDashboard 
        currentStandings={currentStandings}
        teamLogos={teamLogos}
        apiData={apiData}
        supportedTeams={supportedTeams}
      />
      
      {/* Stats Cards */}
      <StatsCards 
        bets={bets} 
        consensusRankings={sortedConsensusRankings} 
        supportedTeams={supportedTeams}
      />

      {/* Performance Analysis Table */}
      <PerformanceAnalysisTable
        bets={bets}
        teamLogos={teamLogos}
        supportedTeams={supportedTeams}
      />
      
      {/* Current standings table - new component */}
      <AllsvenskanStandingsTable
        currentStandings={currentStandings}
        teamLogos={teamLogos}
        apiData={apiData}
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
      {useMobileTable ? (
        <MobileOptimizedTable
          id="standings-table"
          title={<><span className="icon">📊</span> Consensus Rankings & Team Statistics</>}
          data={prepareStandingsData()}
          columns={standingsColumns}
          rowClassName={getStandingsRowClass}
          teamLogos={teamLogos}
          supportedTeams={supportedTeams}
        />
      ) : (
        <ConsensusStandingsTable 
          consensusRankings={sortedConsensusRankings} 
          bets={bets} 
          teamLogos={teamLogos} 
        />
      )}
      
      {/* Individual Predictions */}
      <PredictionsTable 
        bets={bets} 
        supportedTeams={supportedTeams}
        teamLogos={teamLogos} 
        isMobile={isMobile}
      />
    </div>
  );
};

export default Dashboard;