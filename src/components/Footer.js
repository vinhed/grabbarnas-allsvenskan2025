// src/components/Footer.js
import React from 'react';

const Footer = () => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  
  return (
    <footer>
      <div>Updated on {formattedDate}</div>
      <div>Allsvenskan 2025 Prediction League</div>
    </footer>
  );
};

export default Footer;