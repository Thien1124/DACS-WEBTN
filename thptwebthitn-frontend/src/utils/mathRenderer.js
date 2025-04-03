import React from 'react';
import MathJax from 'react-mathjax';

/**
 * Renders text with mathematical formulas using MathJax
 * @param {string} text - Text containing math expressions enclosed in $ signs
 * @returns {React.ReactNode} - Rendered component with math expressions
 */
export const renderMath = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Check if there's any math content to render
  if (!text.includes('$')) {
    return text;
  }

  try {
    return (
      <MathJax.Provider>
        <MathJax.Node formula={text} />
      </MathJax.Provider>
    );
  } catch (error) {
    console.error('Error rendering math expression:', error);
    return text; // Fallback to plain text if rendering fails
  }
};

/**
 * Splits text with math expressions and renders each part appropriately
 * @param {string} text - Text potentially containing math expressions
 * @returns {React.ReactNode[]} - Array of rendered text segments
 */
export const renderTextWithMath = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // If no math expression markers, return as is
  if (!text.includes('$')) {
    return text;
  }

  // Split by math delimiters ($) and render each part
  const segments = text.split(/(\$.*?\$)/g);
  
  return segments.map((segment, index) => {
    if (segment.startsWith('$') && segment.endsWith('$')) {
      // Extract math expression without $ delimiters
      const mathExpr = segment.slice(1, -1);
      return (
        <MathJax.Provider key={index}>
          <MathJax.Node inline formula={mathExpr} />
        </MathJax.Provider>
      );
    }
    return <span key={index}>{segment}</span>;
  });
};
