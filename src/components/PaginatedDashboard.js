import React, { useState, useEffect } from 'react';
import ConsensusStandingsTable from './ConsensusStandingsTable';
import PredictionsTable from './PredictionsTable';
import AllsvenskanStandingsTable from './AllsvenskanStandingsTable';
import PerformanceAnalysisTable from './PerformanceAnalysisTable';
import HistoryTable from './HistoryTable';
import MobilePaginatedDashboard from './MobilePaginatedDashboard';
import './MobilePaginatedDashboard.css';

const PaginatedDashboard = ({ 
  bets, 
  supportedTeams,
  currentStandings, 
  sortedConsensusRankings, 
  funStats, 
  teamLogos,
  apiData,
  isMobile
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const pages = [
    {
      title: "Performance & Standings",
      icon: "🏆",
      components: [
        { name: "Performance Analysis", component: <PerformanceAnalysisTable bets={bets} teamLogos={teamLogos} supportedTeams={supportedTeams} isMobile={isMobile} /> },
        { name: "Current Standings", component: <AllsvenskanStandingsTable currentStandings={currentStandings} teamLogos={teamLogos} apiData={apiData} isMobile={isMobile} /> }
      ]
    },
    {
      title: "Statistics & Predictions",
      icon: "📊",
      components: [
        { name: "Individual Predictions", component: <PredictionsTable bets={bets} supportedTeams={supportedTeams} teamLogos={teamLogos} /> },
        { name: "Consensus Rankings", component: <ConsensusStandingsTable consensusRankings={sortedConsensusRankings} bets={bets} teamLogos={teamLogos} /> },
      ]
    },
    {
      title: "History",
      icon: "📈",
      components: [
        { name: "Historical Rankings", component: <HistoryTable bets={bets} teamLogos={teamLogos} supportedTeams={supportedTeams} isMobile={isMobile} /> }
      ]
    }
  ];

  useEffect(() => {
    try {
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage !== null) {
        setCurrentPage(parseInt(savedPage, 10));
      }
    } catch (e) {
      console.error('Error loading page preference:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('currentPage', currentPage.toString());
    } catch (e) {
      console.error('Error saving page preference:', e);
    }
  }, [currentPage]);

  useEffect(() => {
    const minSwipeDistance = 999999999;

    const handleTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe && currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1);
      }
      if (isRightSwipe && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, currentPage, pages.length]);

  const navigatePage = (direction) => {
    if (direction === 'next' && currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="paginated-dashboard">
      <MobilePaginatedDashboard 
        currentPage={currentPage} 
        onChangePage={setCurrentPage} 
        pages={pages}
        teamLogos={teamLogos}
        supportedTeams={supportedTeams}
        currentStandings={currentStandings}
      />
      
      <div className="tab-navigation">
        {pages.map((page, index) => (
          <button 
            key={index}
            className={`tab-button ${index === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          >
            <span className="tab-icon">{page.icon}</span> {page.title}
          </button>
        ))}
      </div>
      
      <div className="page-content">
        {pages[currentPage].components.map((item, index) => (
          <div key={index} className="page-component">
            {item.component}
          </div>
        ))}
      </div>
      
      <div className="mobile-page-navigation">
        <button 
          className={`mobile-nav-button ${currentPage === 0 ? 'active' : ''}`}
          onClick={() => setCurrentPage(0)}
        >
          <span className="nav-icon">{pages[0].icon}</span>
          <span className="nav-text">{pages[0].title}</span>
        </button>
        <button 
          className={`mobile-nav-button ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          <span className="nav-icon">{pages[1].icon}</span>
          <span className="nav-text">{pages[1].title}</span>
        </button>
        <button 
          className={`mobile-nav-button ${currentPage === 2 ? 'active' : ''}`}
          onClick={() => setCurrentPage(2)}
        >
          <span className="nav-icon">{pages[2].icon}</span>
          <span className="nav-text">{pages[2].title}</span>
        </button>
      </div>
      
    </div>
  );
};

export default PaginatedDashboard;