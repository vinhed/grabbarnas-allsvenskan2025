import React, { useEffect, useState } from 'react';
import TeamLogo from './TeamLogo';

const PredictionsTable = ({ bets, supportedTeams, teamLogos, isMobile }) => {
  const [hoveredTeam, setHoveredTeam] = useState(null);
  const [displayTeamName, setDisplayTeamName] = useState(false);

  // Find the maximum number of predictions by any user
  const maxBets = Math.max(...Object.values(bets).map(userBets => userBets.length));
  const userCount = Object.keys(bets).length;
  
  // Function to toggle display of team names
  const toggleTeamNames = () => {
    setDisplayTeamName(prevState => !prevState);
  };
  
  // Function to render user header with supported team logo
  const renderUserHeader = (user) => {
    const supportedTeam = supportedTeams[user];
    
    return (
      <div className="user-header">
        <span className="user-name">{user}</span>
        {supportedTeam && displayTeamName && (
          <div className="supported-team">
            <TeamLogo team={supportedTeam} logoUrl={teamLogos[supportedTeam]} size="small" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">🔮</span> Individual Predictions</h2>
      
      <div className="display-options">
        <label className="toggle-switch-label">
          <span className="toggle-label">Show Team Names</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={displayTeamName} 
              onChange={toggleTeamNames}
            />
            <span className="toggle-slider"></span>
          </label>
        </label>
      </div>
      
      <div className="table-wrapper">
        <table id="predictions-table">
          <thead>
            <tr>
              <th>#</th>
              {Object.keys(bets).map(user => (
                <th key={user}>
                  {renderUserHeader(user)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxBets }).map((_, i) => {
              let rowClass = "";
              
              // Highlight European qualification and relegation positions
              if (i === 0) {  // Top position (Europa League)
                rowClass = "europaleague";
              } else if (i === 1 || i === 2) {  // 2nd and 3rd position (Conference League)
                rowClass = "conference-league";
              } else if (i >= maxBets - 2) {  // Bottom 2 positions (direct relegation)
                rowClass = "relegation-direct";
              } else if (i === maxBets - 3) {  // 3rd from bottom position (playoff)
                rowClass = "relegation-playoff";
              }
              
              return (
                <tr key={i} className={rowClass}>
                  <td>{i + 1}</td>
                  {Object.entries(bets).map(([user, userBets]) => {
                    const team = i < userBets.length ? userBets[i] : "";
                    const isHighlighted = team === hoveredTeam && team !== "";
                    // Add additional highlighting if team is user's supported team
                    const isSupportedTeam = team === supportedTeams[user];
                    const cellClassName = [
                      isHighlighted ? "team-highlight" : "",
                      isSupportedTeam ? "supported-team-cell" : ""
                    ].filter(Boolean).join(" ");
                    
                    return (
                      <td 
                        key={`${user}-${i}`}
                        className={cellClassName}
                        onMouseEnter={() => team && setHoveredTeam(team)}
                        onMouseLeave={() => setHoveredTeam(null)}
                      >
                        {team && displayTeamName && (
                          <div className="team-name-with-logo">
                            <TeamLogo team={team} logoUrl={teamLogos[team]} />
                            <span>{team}</span>
                          </div>
                        )}

                        {team && !displayTeamName && (
                          <div className="team-name-with-logo-center">
                            <TeamLogo team={team} logoUrl={teamLogos[team]} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PredictionsTable;