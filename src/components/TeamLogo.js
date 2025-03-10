// src/components/TeamLogo.js
import React, { useState } from 'react';

const TeamLogo = ({ team, logoUrl }) => {
  const [hasError, setHasError] = useState(false);

  // Get initials for placeholder
  const getInitials = (teamName) => {
    if (!teamName) return '';
    
    const words = teamName.split(' ');
    const initials = words.map(word => word.charAt(0)).join('');
    
    // Limit to 2 characters
    return initials.substring(0, 2);
  };

  if (!logoUrl || hasError) {
    return (
      <div className="team-logo-placeholder">
        {getInitials(team)}
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={`${team} logo`} 
      className="team-logo" 
      onError={() => setHasError(true)}
    />
  );
};

export default TeamLogo;