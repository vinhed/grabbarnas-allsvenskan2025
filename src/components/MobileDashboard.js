// src/components/MobileDashboard.js
import React, { useState, useEffect } from 'react';
import TeamLogo from './TeamLogo';

const MobileDashboard = ({ currentStandings, teamLogos, apiData, supportedTeams }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [userFavorite, setUserFavorite] = useState(null);
  
  // Find the user's favorite team based on the browser storage
  useEffect(() => {
    try {
      const savedFavorite = localStorage.getItem('userFavoriteTeam');
      if (savedFavorite) {
        setUserFavorite(savedFavorite);
      }
    } catch (e) {
      console.error('Error loading favorite team:', e);
    }
  }, []);
  
  // Set up pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    
    const touchStart = (e) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY <= 0) {
        startY = e.touches[0].pageY;
      }
    };
    
    const touchMove = (e) => {
      if (startY > 0 && !refreshing) {
        currentY = e.touches[0].pageY;
        const distance = currentY - startY;
        
        if (distance > 60 && window.scrollY <= 0) {
          setRefreshing(true);
          // Simulate refresh by updating the timestamp
          setTimeout(() => {
            setLastUpdated(new Date());
            setRefreshing(false);
            startY = 0;
            currentY = 0;
          }, 1500);
        }
      }
    };
    
    const touchEnd = () => {
      startY = 0;
      currentY = 0;
    };
    
    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchmove', touchMove, { passive: true });
    document.addEventListener('touchend', touchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd);
    };
  }, [refreshing]);
  
  // Set user's favorite team
  const selectFavoriteTeam = (team) => {
    setUserFavorite(team);
    try {
      localStorage.setItem('userFavoriteTeam', team);
    } catch (e) {
      console.error('Error saving favorite team:', e);
    }
  };
  
  // Calculate completion percentage of the season
  const calculateSeasonCompletion = () => {
    if (!apiData) return 0;
    
    let totalMatches = 0;
    let playedMatches = 0;
    
    for (const key in apiData) {
      if (key === 'undefined' || !key.match(/^\d+$/)) continue;
      
      const teamInfo = apiData[key];
      if (teamInfo.stats) {
        for (const stat of teamInfo.stats) {
          if (stat.name === 'gp' && stat.value > 0) {
            playedMatches += stat.value;
          }
          if (stat.name === 'g' && stat.value > 0) {
            totalMatches += stat.value;
          }
        }
      }
    }
    
    if (totalMatches === 0) return 0;
    return (playedMatches / totalMatches * 100).toFixed(1);
  };
  
  // Format date in a user-friendly way
  const formatLastUpdated = (date) => {
    return date.toLocaleString();
  };
  
  // Generate quicklinks for navigation
  const renderQuickLinks = () => {
    const sections = [
      { name: 'Rankings', icon: '📊', target: '.compact-fun-stats-section' },
      { name: 'Standings', icon: '🏅', target: '#standings-table' },
      { name: 'Predictions', icon: '🔮', target: '#predictions-table' }
    ];
    
    return (
      <div className="quick-links">
        {sections.map((section, index) => (
          <button 
            key={index} 
            className="quick-link"
            onClick={() => {
              const target = document.querySelector(section.target);
              if (target) {
                // Expand section if collapsed
                const sectionElement = target.closest('.section') || 
                                       target.closest('.compact-fun-stats-section');
                if (sectionElement && sectionElement.classList.contains('collapsed')) {
                  sectionElement.classList.remove('collapsed');
                }
                
                // Scroll to target
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <span className="quick-link-icon">{section.icon}</span>
            <span className="quick-link-label">{section.name}</span>
          </button>
        ))}
      </div>
    );
  };
  
  
  // Render top predictions card
  const renderTopPredictionsCard = () => {
    // Get first team from standings or default text
    const topTeam = currentStandings.length > 0 ? currentStandings[0] : 'No data available';
    
    return (
      <div className="top-predictions-card">
        <h3>Current Leader</h3>
        
        <div className="top-team">
          {currentStandings.length > 0 && (
            <>
              <TeamLogo team={topTeam} logoUrl={teamLogos[topTeam]} />
              <span className="top-team-name">{topTeam}</span>
            </>
          )}
          
          {currentStandings.length === 0 && (
            <span className="no-data">No standings data available</span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <section className="mobile-dashboard">
      
      {activeTab === 'overview' && (
        <div className="dashboard-tab-content">
          {renderTopPredictionsCard()}
          {renderQuickLinks()}
        </div>
      )}
      
      {activeTab === 'favorite' && (
        <div className="dashboard-tab-content">
          {renderFavoriteTeamCard()}
        </div>
      )}
      
      {refreshing && (
        <div className="pull-to-refresh visible refreshing">
          Refreshing...
        </div>
      )}
    </section>
  );
};

export default MobileDashboard;