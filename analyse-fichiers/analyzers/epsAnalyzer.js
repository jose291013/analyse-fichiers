// analyzers/epsAnalyzer.js
const fs = require('fs');

async function analyzeEPS(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const boundingBoxLine = data.split('\n').find(line => line.startsWith('%%BoundingBox:'));

  if (!boundingBoxLine) {
    throw new Error('BoundingBox non trouvé');
  }

  const parts = boundingBoxLine.split(' ');
  const x1 = parseFloat(parts[1]);
  const y1 = parseFloat(parts[2]);
  const x2 = parseFloat(parts[3]);
  const y2 = parseFloat(parts[4]);

  const width = x2 - x1;
  const height = y2 - y1;

  return {
    type: 'EPS',
    width,
    height,
    unit: 'pt' // PostScript points (1 pt = 1/72 inch)
  };
}

module.exports = { analyzeEPS };
