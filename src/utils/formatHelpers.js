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