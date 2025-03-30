// src/components/AllsvenskanStandingsTable.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';
import './AllsvenskanStandingsTable.css';
import { teamNameFormat } from '../utils/formatHelpers';

const AllsvenskanStandingsTable = ({ currentStandings, teamLogos, apiData, isMobile }) => {
  const [expandedView, setExpandedView] = useState(!isMobile);
  const [highlightedTeam, setHighlightedTeam] = useState(null);

  // Check if we have actual standings data
  const hasStandingsData = currentStandings && currentStandings.length > 0;

  // Process standings data to include more statistics
  const processStandingsData = () => {
    if (!apiData || !currentStandings || currentStandings.length === 0) {
      return [];
    }

    const processedData = [];

    // Process each team
    for (let team of currentStandings) {
      // Find team in API data
      const teamData = Object.values(apiData).find(t => 
        t.displayName === team || t.name === team
      );

      if (teamData) {
        // Extract basic info
        const position = parseInt(teamData.position) || processedData.length + 1;
        
        // Create stats object
        const stats = {
          gp: 0, // Games played
          w: 0, // Wins
          t: 0, // Ties
          l: 0, // Losses
          gf: 0, // Goals for
          ga: 0, // Goals against
          gd: 0, // Goal difference
          pts: 0 // Points
        };

        // Extract stats
        if (teamData.stats && Array.isArray(teamData.stats)) {
          for (const stat of teamData.stats) {
            if (stats[stat.name] !== undefined) {
              stats[stat.name] = parseInt(stat.value) || 0;
            }
          }
        }

        // Calculate goal difference if not provided
        if (!stats.gd && stats.gf !== undefined && stats.ga !== undefined) {
          stats.gd = stats.gf - stats.ga;
        }

        // Calculate form based on recent results (if available)
        let form = [];
        if (teamData.form && Array.isArray(teamData.form)) {
          form = teamData.form.slice(0, 5);
        }

        team = teamNameFormat[team];
        
        // Add team to processed data
        processedData.push({
          position,
          name: team,
          logo: teamLogos[team] || '',
          stats,
          form
        });
      } else {
        // If no API data, create minimal entry
        processedData.push({
          position: processedData.length + 1,
          name: team,
          logo: teamLogos[team] || '',
          stats: {
            gp: 0, w: 0, t: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
          },
          form: []
        });
      }
    }

    // Sort by position
    return processedData.sort((a, b) => a.position - b.position);
  };

  const standingsData = processStandingsData();
  const teamCount = standingsData.length;

  // Helper to determine row class for standings
  const getStandingsRowClass = (position) => {
    if (position === 1) {
      return "europaleague";
    } else if (position === 2 || position === 3) {
      return "conference-league";
    } else if (position >= teamCount - 1 && teamCount > 2) {
      return "relegation-direct";
    } else if (position === teamCount - 2 && teamCount > 3) {
      return "relegation-playoff";
    }
    return "";
  };

  // Format form indicators
  const renderForm = (form) => {
    if (!form || form.length === 0) return <span className="no-form-data">No form data</span>;
    
    return (
      <div className="form-indicators">
        {form.map((result, index) => {
          let formClass = '';
          let formLabel = '';
          
          switch(result["matchResult"].toLowerCase()) {
            case 'w':
              formClass = 'form-win';
              formLabel = 'W';
              break;
            case 'd':
              formClass = 'form-draw';
              formLabel = 'D';
              break;
            case 'l':
              formClass = 'form-loss';
              formLabel = 'L';
              break;
            default:
              formClass = '';
              formLabel = '-';
          }
          
          return (
            <span key={index} className={`form-indicator ${formClass}`}>{formLabel}</span>
          );
        })}
      </div>
    );
  };

  return (
    <section className="section" id="current-standings-section">
      <h2 className="section-title"><span className="icon">🏆</span> Current Allsvenskan Standings</h2>
      
      {!hasStandingsData ? (
        <div className="no-data-message">No standings data available</div>
      ) : (
        <>
          <div className="standings-view-controls">
            <button 
              className={`view-toggle-btn ${expandedView ? '' : 'active'}`}
              onClick={() => setExpandedView(false)}
            >
              Compact
            </button>
            <button 
              className={`view-toggle-btn ${expandedView ? 'active' : ''}`}
              onClick={() => setExpandedView(true)}
            >
              Expanded
            </button>
          </div>
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color legend-europaleague"></div>
              <span>Europa League (1st Place)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-conference"></div>
              <span>Conference League (2nd-3rd Place)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-direct"></div>
              <span>Direct Relegation (Bottom 2)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-playoff"></div>
              <span>Relegation Playoff (14th Place)</span>
            </div>
          </div>
          
          <div className="standings-table-wrapper">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="position-col">#</th>
                  <th className="team-col">Team</th>
                  <th className="numeric-col">MP</th>
                  {expandedView && (
                    <>
                      <th className="numeric-col">W</th>
                      <th className="numeric-col">D</th>
                      <th className="numeric-col">L</th>
                    </>
                  )}
                  {expandedView && (
                    <>
                      <th className="numeric-col">GF</th>
                      <th className="numeric-col">GA</th>
                    </>
                  )}
                  <th className="numeric-col">GD</th>
                  <th className="numeric-col points-col">PTS</th>
                  {expandedView && (
                    <th className="form-col">Form</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {standingsData.map((team) => {
                  const rowClass = getStandingsRowClass(team.position);
                  const isHighlighted = team.name === highlightedTeam;
                  
                  return (
                    <tr 
                      key={team.name} 
                      className={`${rowClass} ${isHighlighted ? 'team-highlight' : ''}`}
                      onMouseEnter={() => setHighlightedTeam(team.name)}
                      onMouseLeave={() => setHighlightedTeam(null)}
                    >
                      <td className="position-col">{team.position}</td>
                      <td className="team-col">
                        <div className="team-name-with-logo">
                          {<TeamLogo team={team.name} logoUrl={team.logo} size='big'/>}
                          {!isMobile && <span>{team.name}</span>}
                        </div>
                      </td>
                      <td className="numeric-col">{team.stats.gp}</td>
                      {expandedView && (
                        <>
                          <td className="numeric-col">{team.stats.w}</td>
                          <td className="numeric-col">{team.stats.t}</td>
                          <td className="numeric-col">{team.stats.l}</td>
                        </>
                      )}
                      {expandedView && (
                        <>
                          <td className="numeric-col">{team.stats.gf}</td>
                          <td className="numeric-col">{team.stats.ga}</td>
                        </>
                      )}
                      <td className={`numeric-col ${team.stats.gd > 0 ? 'positive-gd' : (team.stats.gd < 0 ? 'negative-gd' : '')}`}>
                        {team.stats.gd > 0 ? '+' : ''}{team.stats.gd}
                      </td>
                      <td className="numeric-col points-col">{team.stats.pts}</td>
                      {expandedView && (
                        <td className="form-col">
                          {renderForm(team.form)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="table-note">Scroll horizontally to see more data</div>
        </>
      )}
    </section>
  );
};

export default AllsvenskanStandingsTable;