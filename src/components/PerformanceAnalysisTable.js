// src/components/PerformanceAnalysisTable.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';
import DetailedPredictionsModal from './DetailedPredictionsModal';
import { fetchFullData } from '../api/allsvenskanApi';
import './PerformanceAnalysisTable.css';

const PerformanceAnalysisTable = ({ bets, teamLogos, supportedTeams, isMobile }) => {
  const [currentStandings, setCurrentStandings] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'averageRating', direction: 'desc' });
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch current standings data
        const apiData = await fetchFullData();
        
        if (!apiData) {
          throw new Error("Failed to fetch standings data");
        }
        
        // Extract team standings from API data
        const standings = extractStandings(apiData);
        setCurrentStandings(standings);
        
        // Calculate performance metrics for each person
        if (standings.length > 0 && bets && Object.keys(bets).length > 0) {
          const calculatedPerformance = calculatePerformanceMetrics(bets, standings);
          setPerformanceData(calculatedPerformance);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading performance analysis data:", err);
        setError("Failed to load analysis data. Please try again later.");
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set initial view mode based on screen width
    const handleResize = () => {
    };
    
    // Set initial view mode
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [bets]);

  // Extract standings data from API response
  const extractStandings = (apiData) => {
    const teams = [];
    
    // Process API data to extract team standings
    for (const key in apiData) {
      if (key === 'undefined' || !key.match(/^\d+$/)) continue;
      
      const teamInfo = apiData[key];
      if (teamInfo && teamInfo.displayName) {
        teams.push({
          position: teamInfo.position || parseInt(key),
          name: teamInfo.displayName,
          logoUrl: teamInfo.logoImageUrl || ''
        });
      }
    }
    
    // Sort by current position
    teams.sort((a, b) => a.position - b.position);
    
    // If the current position is 0 (no games played), use the order from API
    if (teams.length > 0 && teams[0].position === 0) {
      // All teams have position 0, so use the order they appear in API
      teams.forEach((team, index) => {
        team.position = index + 1;
      });
    }
    
    // Return just the team names in order
    return teams.map(team => team.name);
  };

  // Calculate performance metrics for each person's predictions
  const calculatePerformanceMetrics = (predictions, actualStandings) => {
    const results = [];
    const hasSeasonStarted = actualStandings.length > 0 && 
                             actualStandings.every(team => team && team.trim() !== '');
    
    for (const [person, prediction] of Object.entries(predictions)) {
      // Skip if prediction is not an array
      if (!Array.isArray(prediction)) continue;
      
      let totalScore = 0;
      let bestDifference = Infinity;
      let worstDifference = -Infinity;
      let bestTeam = '';
      let worstTeam = '';
      const teamDetails = [];
      
      // If season hasn't started, use consensus standings
      const standingsToUse = hasSeasonStarted ? actualStandings : Object.keys(predictions);
      
      // Calculate metrics for each team in the prediction
      for (let i = 0; i < prediction.length; i++) {
        const team = prediction[i];
        const predictedPosition = i + 1;
        
        // Find the actual position in standings
        const actualPosition = standingsToUse.indexOf(team) + 1;
        
        if (actualPosition > 0) {
          const positionDifference = Math.abs(predictedPosition - actualPosition);
          totalScore += positionDifference;
          
          // Track best prediction (smallest difference)
          if (positionDifference < bestDifference) {
            bestDifference = positionDifference;
            bestTeam = team;
          }
          
          // Track worst prediction (largest difference)
          if (positionDifference > worstDifference) {
            worstDifference = positionDifference;
            worstTeam = team;
          }
          
          // Store details for each team
          teamDetails.push({
            team,
            predictedPosition,
            actualPosition,
            difference: positionDifference
          });
        }
      }
      
      const maxPossibleDifference = 128;

      // Calculate the final score (128 - total score)
      const finalScore = maxPossibleDifference - totalScore;
      const teamsMatched = teamDetails.length;
      
      // Calculate best and worst team ratings
      const bestRating = bestDifference;
      const worstRating = worstDifference;
      
      // Calculate average difference
      const averageDifference = teamsMatched > 0 ? (totalScore / teamsMatched).toFixed(2) : 'N/A';
      
      const accuracy = teamsMatched > 0 
        ? (100 - (totalScore / maxPossibleDifference * 100)).toFixed(2)
        : 'N/A';
      
      // Update team details with individual differences
      teamDetails.forEach(detail => {
        detail.rating = detail.difference; // Store just the difference for each team
      });
      
      results.push({
        person,
        averageDifference,
        averageRating: (finalScore / maxPossibleDifference * 100).toFixed(1),
        bestTeam,
        bestRating,
        worstTeam,
        worstRating,
        accuracy,
        supportedTeam: supportedTeams[person],
        teamDetails,
        totalScore
      });
    }
    
    // Sort results based on current sort configuration
    return sortData(results, sortConfig);
  };

  // Sort data based on column and direction
  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[config.key] === 'N/A') return 1;
      if (b[config.key] === 'N/A') return -1;
      
      const valueA = typeof a[config.key] === 'string' 
        ? parseFloat(a[config.key]) || a[config.key] 
        : a[config.key];
      const valueB = typeof b[config.key] === 'string' 
        ? parseFloat(b[config.key]) || b[config.key] 
        : b[config.key];
      
      if (valueA < valueB) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle column header click for sorting
  const handleSort = (key, event) => {
    // Stop event propagation to prevent triggering row click
    if (event) {
      event.stopPropagation();
    }
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    setPerformanceData(sortData(performanceData, { key, direction }));
  };

  // Helper to render sort indicator arrows
  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle row click to show detailed predictions
  const handleRowClick = (person) => {
    setSelectedPerson(person);
    setShowDetailedModal(true);
  };

  // Close the detailed predictions modal
  const handleCloseModal = () => {
    setShowDetailedModal(false);
    setSelectedPerson(null);
  };

  // Render table view
  const renderTableView = () => {
    return (
      <div className="table-wrapper">
        <table className="performance-table">
          <thead>
            <tr>
              <th>
                #
              </th>
              <th>
                Participant
              </th>
              <th>
                Score
              </th>
              <th>
                Avg. Diff
              </th>
              <th>Best</th>
              <th>Worst</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((person, index) => {
              const position = index + 1;
              const medalClass = position <= 3 ? `medal-${position}` : "";
              
              return (
                <tr 
                  key={person.person} 
                  className={`${medalClass} clickable-row`}
                  onClick={() => handleRowClick(person.person)}
                >
                  <td>{position}</td>
                  <td>
                    <div className="participant-with-team">
                      <span className="participant-name">{person.person}</span>
                      {person.supportedTeam && teamLogos[person.supportedTeam] && (
                        <div className="supported-team-icon">
                          {!isMobile && <TeamLogo team={person.supportedTeam} logoUrl={teamLogos[person.supportedTeam]} size="small" />}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="performance-rating">{person.averageRating}</td>
                  <td>{person.averageDifference}</td>
                  <td className="best-prediction">
                    {person.bestTeam && (
                      <div className="team-prediction">
                        {<TeamLogo team={person.bestTeam} logoUrl={teamLogos[person.bestTeam]} />}
                        {!isMobile && <span>{person.bestTeam}</span>}
                        <span className="prediction-rating"> ({person.bestRating})</span>
                      </div>
                    )}
                  </td>
                  <td className="worst-prediction">
                    {person.worstTeam && (
                      <div className="team-prediction">
                        {<TeamLogo team={person.worstTeam} logoUrl={teamLogos[person.worstTeam]} />}
                        {!isMobile && <span>{person.worstTeam}</span>}
                        <span className="prediction-rating"> ({person.worstRating})</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading performance analysis...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">🏆</span> Prediction Performance Analysis</h2>
      
      {renderTableView()}
      
      {/* Detailed Predictions Modal */}
      {showDetailedModal && (
        <DetailedPredictionsModal
          person={selectedPerson}
          data={performanceData}
          teamLogos={teamLogos}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default PerformanceAnalysisTable;