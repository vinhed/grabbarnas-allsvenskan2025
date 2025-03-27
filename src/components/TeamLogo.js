// src/components/TeamLogo.js
import React, { useState } from 'react';

const TeamLogo = ({ team, logoUrl, size = 'normal' }) => {
  const [hasError, setHasError] = useState(false);

  // Get initials for placeholder
  const getInitials = (teamName) => {
    if (!teamName) return '';
    
    const words = teamName.split(' ');
    const initials = words.map(word => word.charAt(0)).join('');
    
    // Limit to 2 characters
    return initials.substring(0, 2);
  };

  // Determine CSS class based on size
  const sizeClass = (size === 'small') ? 'team-logo-small' : (size === 'big' ? 'team-logo-big': 'team-logo');
  const placeholderClass = (size === 'small') ? 'team-logo-placeholder-small' : (size === 'big' ? 'team-logo-placeholder-big': 'team-logo-placeholder');

  if (!logoUrl || hasError) {
    return (
      <div className={placeholderClass}>
        {getInitials(team)}
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={`${team} logo`} 
      className={sizeClass} 
      onError={() => setHasError(true)}
    />
  );
};

export default TeamLogo;