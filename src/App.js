// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import { fetchAllsvenskanStandings, fetchFullData } from './api/allsvenskanApi';
import { calculateConsensusRankings, calculateFunStats } from './utils/statsCalculator';
import './App.css';

function App() {
  const [bets, setBets] = useState({});
  const [currentStandings, setCurrentStandings] = useState([]);
  const [sortedConsensusRankings, setSortedConsensusRankings] = useState({});
  const [funStats, setFunStats] = useState({});
  const [teamLogos, setTeamLogos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState({});

  // FOR DEVELOPMENT: Mock data to use if fetch fails
  const mockBets = {
    "Martin": [
      "Malmö FF", "Djurgården", "Hammarby", "AIK", "BK Häcken", "IF Elfsborg",
      "IFK Göteborg", "IFK Norrköping", "IK Sirius", "BP", "Mjällby AIF",
      "IFK Värnamo", "Halmstads BK", "Degerfors IF", "GAIS", "Östers IF"
    ],
    "Johan": [
      "Malmö FF", "AIK", "Djurgården", "Hammarby", "IF Elfsborg", "BK Häcken",
      "IFK Göteborg", "IFK Norrköping", "Halmstads BK", "Mjällby AIF", "BP",
      "IK Sirius", "IFK Värnamo", "GAIS", "Östers IF", "Degerfors IF"
    ],
    "Erik": [
      "Malmö FF", "Hammarby", "Djurgården", "IF Elfsborg", "BK Häcken", "AIK",
      "IFK Norrköping", "IFK Göteborg", "BP", "IK Sirius", "Mjällby AIF",
      "Halmstads BK", "IFK Värnamo", "GAIS", "Östers IF", "Degerfors IF"
    ]
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load bets data from file
        let betsData;
        try {
          const betsResponse = await fetch('/data/bets.json');
          if (!betsResponse.ok) {
            throw new Error(`Failed to fetch bets data: ${betsResponse.status}`);
          }
          betsData = await betsResponse.json();
        } catch (fetchError) {
          console.warn("Could not load bets.json, using mock data:", fetchError);
          betsData = mockBets;
        }
        
        setBets(betsData);
        
        // Calculate consensus rankings
        const consensusRankings = calculateConsensusRankings(betsData);
        setSortedConsensusRankings(consensusRankings);
        
        // Calculate fun statistics
        const stats = calculateFunStats(betsData, consensusRankings);
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
    const manualMapping = createManualTeamMapping();
    
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
            teamLogos[team] = apiTeam.logoUrl;
            matched = true;
            break;
          }
        }
      }
      
      // Try exact match (case insensitive)
      if (!matched) {
        for (const apiTeam of apiTeams) {
          if (teamLower === apiTeam.name.toLowerCase().trim()) {
            teamLogos[team] = apiTeam.logoUrl;
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
            teamLogos[team] = apiTeam.logoUrl;
            matched = true;
            break;
          }
          // API team name is in our team name
          else if (apiTeam.name.toLowerCase().includes(teamLower) || 
                   (apiTeam.abbreviation && apiTeam.abbreviation.toLowerCase() === teamLower)) {
            teamLogos[team] = apiTeam.logoUrl;
            matched = true;
            break;
          }
        }
      }
    }
    
    return teamLogos;
  };

  // Helper function to create manual mapping for teams
  const createManualTeamMapping = () => {
    return {
      "Malmö": "Malmö FF",
      "Malmö FF": "Malmö FF",
      "MFF": "Malmö FF",
      "AIK": "AIK",
      "Djurgården": "Djurgården",
      "DIF": "Djurgården",
      "Hammarby": "Hammarby",
      "Bajen": "Hammarby",
      "IFK Göteborg": "IFK Göteborg",
      "Göteborg": "IFK Göteborg",
      "Blåvitt": "IFK Göteborg",
      "Häcken": "BK Häcken",
      "BK Häcken": "BK Häcken",
      "Elfsborg": "IF Elfsborg",
      "IF Elfsborg": "IF Elfsborg",
      "IFK Norrköping": "IFK Norrköping",
      "Peking": "IFK Norrköping",
      "Värnamo": "IFK Värnamo",
      "IFK Värnamo": "IFK Värnamo",
      "Sirius": "IK Sirius",
      "IK Sirius": "IK Sirius",
      "Mjällby": "Mjällby AIF",
      "Mjällby AIF": "Mjällby AIF",
      "MAIF": "Mjällby AIF",
      "BP": "BP",
      "Brommapojkarna": "BP",
      "Degerfors": "Degerfors IF",
      "Degerfors IF": "Degerfors IF",
      "Halmstad": "Halmstads BK",
      "Halmstads BK": "Halmstads BK",
      "HBK": "Halmstads BK",
      "GAIS": "GAIS",
      "Gais": "GAIS",
      "Öster": "Östers IF",
      "Östers IF": "Östers IF",
      "Östers": "Östers IF"
    };
  };

  if (isLoading) {
    return <div className="loading">Loading Allsvenskan 2025 predictions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  bets={bets}
                  currentStandings={currentStandings}
                  sortedConsensusRankings={sortedConsensusRankings}
                  funStats={funStats}
                  teamLogos={teamLogos}
                  apiData={apiData}
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