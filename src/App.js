// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PaginatedDashboard from './components/PaginatedDashboard';
import { fetchAllsvenskanStandings, fetchFullData } from './api/allsvenskanApi';
import { calculateConsensusRankings, calculateFunStats } from './utils/statsCalculator';
import { initMobileEnhancements, optimizeTablesForMobile, enhanceScrolling } from './utils/mobileUtils';
import './App.css';
import './components/PaginatedDashboard.css';
import './components/MobilePaginatedDashboard.css';
import {teamNameFormat} from './utils/formatHelpers';

function App() {
  const [bets, setBets] = useState({});
  const [supportedTeams, setSupportedTeams] = useState({});
  const [currentStandings, setCurrentStandings] = useState([]);
  const [sortedConsensusRankings, setSortedConsensusRankings] = useState({});
  const [funStats, setFunStats] = useState({});
  const [teamLogos, setTeamLogos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // FOR DEVELOPMENT: Mock data to use if fetch fails
  const mockBets = {
    "A": {
      "predictions": [
        "Malmö FF", "Djurgården", "Hammarby", "AIK", "BK Häcken", "IF Elfsborg",
        "IFK Göteborg", "IFK Norrköping", "IK Sirius", "BP", "Mjällby AIF",
        "IFK Värnamo", "Halmstads BK", "Degerfors IF", "GAIS", "Östers IF"
      ],
      "supportedTeam": "AIK"
    },
    "B": {
      "predictions": [
        "Malmö FF", "AIK", "Djurgården", "Hammarby", "IF Elfsborg", "BK Häcken",
        "IFK Göteborg", "IFK Norrköping", "Halmstads BK", "Mjällby AIF", "BP",
        "IK Sirius", "IFK Värnamo", "GAIS", "Östers IF", "Degerfors IF"
      ],
      "supportedTeam": "Djurgården"
    },
    "C": {
      "predictions": [
        "Malmö FF", "Hammarby", "Djurgården", "IF Elfsborg", "BK Häcken", "AIK",
        "IFK Norrköping", "IFK Göteborg", "BP", "IK Sirius", "Mjällby AIF",
        "Halmstads BK", "IFK Värnamo", "GAIS", "Östers IF", "Degerfors IF"
      ],
      "supportedTeam": "Hammarby"
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load bets data from file
        let betsData;
        let predictionsOnly = {};
        let supportedTeamsMap = {};
        
        try {
          const betsResponse = await fetch(`https://raw.githubusercontent.com/vinhed/grabbarnas-allsvenskan2025/refs/heads/main/public/data/bets.json?nocache=${new Date().getTime()}`);
          if (!betsResponse.ok) {
            throw new Error(`Failed to fetch bets data: ${betsResponse.status}`);
          }
          betsData = await betsResponse.json();
          
          // Extract predictions and supported teams
          for (const [user, userData] of Object.entries(betsData)) {
            if (userData.predictions) {
              predictionsOnly[user] = userData.predictions;
              supportedTeamsMap[user] = userData.supportedTeam || null;
            } else {
              // Handle old format as fallback
              predictionsOnly[user] = userData;
            }
          }
        } catch (fetchError) {
          console.warn("Could not load bets.json, using mock data:", fetchError);
          
          // Extract predictions and supported teams from mock data
          for (const [user, userData] of Object.entries(mockBets)) {
            predictionsOnly[user] = userData.predictions;
            supportedTeamsMap[user] = userData.supportedTeam || null;
          }
        }
        
        setBets(predictionsOnly);
        setSupportedTeams(supportedTeamsMap);
        
        // Calculate consensus rankings
        const consensusRankings = calculateConsensusRankings(predictionsOnly);
        setSortedConsensusRankings(consensusRankings);
        
        // Calculate fun statistics with supported teams info
        const stats = calculateFunStats(predictionsOnly, consensusRankings, supportedTeamsMap);
        setFunStats(stats);
        
        // Fetch API data for team logos and standings
        try {
          const fullApiData = await fetchFullData();
          setApiData(fullApiData || {});
          
          // Extract team logos
          if (fullApiData) {
            const logos = extractTeamLogos(fullApiData, Object.keys(consensusRankings));
            setTeamLogos(logos);
          }
          
          // Get current standings
          const standings = await fetchAllsvenskanStandings();
          setCurrentStandings(standings || []);
        } catch (apiError) {
          console.warn("Could not fetch API data:", apiError);
          // Continue with the application even if API call fails
        }
        
        setIsLoading(false);
        
        // Initialize mobile enhancements after data is loaded
        setTimeout(() => {
          initMobileEnhancements();
          optimizeTablesForMobile();
          enhanceScrolling();
        }, 500);
      } catch (error) {
        console.error("Error loading application data:", error);
        setError("Failed to load application data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Helper function to extract team logos from API data
  const extractTeamLogos = (apiData, predictionTeams) => {
    const teamLogos = {};
    
    if (!apiData) return teamLogos;
    
    // Create manual mapping for team names
    const manualMapping = teamNameFormat;
    
    // Build a map of API team names to logo URLs
    const apiTeams = [];
    
    for (const key in apiData) {
      if (key === 'undefined' || !key.match(/^\d+$/)) continue;
      
      const teamInfo = apiData[key];
      const teamName = teamInfo.displayName || '';
      const logoUrl = teamInfo.logoImageUrl || '';
      
      if (teamName && logoUrl) {
        apiTeams.push({
          name: teamName,
          abbreviation: teamInfo.abbrv || '',
          fullName: teamInfo.name || '',
          logoUrl: logoUrl
        });
      }
    }
    
    // Match prediction teams with API teams
    for (const team of predictionTeams) {
      let matched = false;
      const teamLower = team.toLowerCase().trim();
      
      // Try direct match with manual mapping
      if (manualMapping[team]) {
        const apiName = manualMapping[team];
        for (const apiTeam of apiTeams) {
          if (apiName.toLowerCase() === apiTeam.name.toLowerCase()) {
            teamLogos[teamNameFormat[team]] = apiTeam.logoUrl;
            matched = true;
            break;
          }
        }
      }
      
      // Try exact match (case insensitive)
      if (!matched) {
        for (const apiTeam of apiTeams) {
          if (teamLower === apiTeam.name.toLowerCase().trim()) {
            teamLogos[teamNameFormat[team]] = apiTeam.logoUrl;
            matched = true;
            break;
          }
        }
      }
      
      // Try substring match
      if (!matched) {
        for (const apiTeam of apiTeams) {
          // Our team name is in API team name
          if (teamLower.includes(apiTeam.name.toLowerCase()) || 
              teamLower.includes(apiTeam.fullName.toLowerCase())) {
            teamLogos[teamNameFormat[team]] = apiTeam.logoUrl;
            matched = true;
            break;
          }
          // API team name is in our team name
          else if (apiTeam.name.toLowerCase().includes(teamLower) || 
                   (apiTeam.abbreviation && apiTeam.abbreviation.toLowerCase() === teamLower)) {
            teamLogos[teamNameFormat[team]] = apiTeam.logoUrl;
            matched = true;
            break;
          }
        }
      }
    }
    
    return teamLogos;
  };

  if (isLoading) {
    return <div className="loading">Loading Allsvenskan 2025 predictions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Use the base path from PUBLIC_URL for GitHub Pages
  const basePath = process.env.PUBLIC_URL || '';

  return (
    <Router basename={basePath}>
      <div className="app">
        <Header />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <PaginatedDashboard 
                  bets={bets}
                  supportedTeams={supportedTeams}
                  currentStandings={currentStandings}
                  sortedConsensusRankings={sortedConsensusRankings}
                  funStats={funStats}
                  teamLogos={teamLogos}
                  apiData={apiData}
                  isMobile={isMobile}
                />
              } 
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;