// src/utils/formatHelpers.js

/**
 * Format a list of items with commas and '&' before the last item
 * @param {Array} itemsList - Array of items to format
 * @returns {string} Formatted string with proper separators
 */
export const formatList = (itemsList) => {
    if (!itemsList || itemsList.length === 0) {
      return "";
    }
    
    if (itemsList.length === 1) {
      return itemsList[0];
    } else if (itemsList.length === 2) {
      return `${itemsList[0]} & ${itemsList[1]}`;
    } else {
      return `${itemsList.slice(0, -1).join(',  ')} & ${itemsList[itemsList.length - 1]}`;
    }
  };

export const teamNameFormat = {
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
  "MAIF": "Mjällby",
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