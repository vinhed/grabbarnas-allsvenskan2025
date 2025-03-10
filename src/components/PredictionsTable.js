// src/components/PredictionsTable.js
import React, { useState } from 'react';
import TeamLogo from './TeamLogo';

const PredictionsTable = ({ bets, teamLogos }) => {
  const [hoveredTeam, setHoveredTeam] = useState(null);
  
  // Find the maximum number of predictions by any user
  const maxBets = Math.max(...Object.values(bets).map(userBets => userBets.length));
  const userCount = Object.keys(bets).length;
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">🔮</span> Individual Predictions</h2>
      <p className="section-description">Scroll horizontally to see all predictions.</p>
      
      <div className="table-wrapper">
        <table id="predictions-table">
          <thead>
            <tr>
              <th>#</th>
              {Object.keys(bets).map(user => (
                <th key={user}>{user}</th>
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
                    
                    return (
                      <td 
                        key={`${user}-${i}`}
                        className={isHighlighted ? "team-highlight" : ""}
                        onMouseEnter={() => team && setHoveredTeam(team)}
                        onMouseLeave={() => setHoveredTeam(null)}
                      >
                        {team && (
                          <div className="team-name-with-logo">
                            <TeamLogo team={team} logoUrl={teamLogos[team]} />
                            <span>{team}</span>
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