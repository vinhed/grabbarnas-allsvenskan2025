// src/components/SupporterTeamSection.js
import React from 'react';
import TeamLogo from './TeamLogo';

const SupporterTeamSection = ({ supportedTeams, teamLogos }) => {
  // Group users by their supported team
  const groupedByTeam = {};
  
  Object.entries(supportedTeams).forEach(([user, team]) => {
    if (!team) return;
    
    if (!groupedByTeam[team]) {
      groupedByTeam[team] = [];
    }
    groupedByTeam[team].push(user);
  });
  
  // Sort teams by number of supporters (most first)
  const sortedTeams = Object.entries(groupedByTeam)
    .sort(([, usersA], [, usersB]) => usersB.length - usersA.length);
  
  return (
    <section className="section">
      <h2 className="section-title"><span className="icon">👥</span> Fans & Allegiances</h2>
      
      <div className="fan-loyalty">
        <div className="fan-loyalty-title">
          <span className="fan-loyalty-icon">⚽</span>
          <span>Teams We Support</span>
        </div>
        
        <div className="loyalty-grid">
          {sortedTeams.map(([team, users]) => (
            <div key={team} className="loyalty-item">
              <TeamLogo team={team} logoUrl={teamLogos[team]} />
              <span className="loyalty-team-name">{team}</span>
              <span className="loyalty-user-count">({users.length})</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fan-loyalty" style={{ marginTop: '15px' }}>
        <div className="fan-loyalty-title">
          <span className="fan-loyalty-icon">👤</span>
          <span>Fan Allegiances</span>
        </div>
        
        <div className="loyalty-grid">
          {Object.entries(supportedTeams).map(([user, team]) => (
            team && (
              <div key={user} className="loyalty-item">
                <span className="loyalty-fan-name">{user}:</span>
                <TeamLogo team={team} logoUrl={teamLogos[team]} size="small" />
                <span>{team}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupporterTeamSection;