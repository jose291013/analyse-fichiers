// analyzers/epsAnalyzer.js
const fs = require('fs');
const path = require('path');

async function analyzeEPS(filePath) {
  let epsContent = fs.readFileSync(filePath, 'utf-8');

  // Ta logique d'analyse (dimensions EPS)
  const width_mm = 100; // exemple
  const height_mm = 200; // exemple

  const artboardWidth = Math.round(width_mm);
  const artboardHeight = Math.round(height_mm);
  const contentWidth = Math.round(width_mm);
  const contentHeight = Math.round(height_mm);

  let modified = false;
  let modifiedFilePath = null;

  if (artboardWidth === contentWidth && artboardHeight === contentHeight) {
    const margin = 2; // mm
    epsContent = epsContent.replace(
      /%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/,
      (_, x1, y1, x2, y2) => {
        const newX1 = parseInt(x1) - margin;
        const newY1 = parseInt(y1) - margin;
        const newX2 = parseInt(x2) + margin;
        const newY2 = parseInt(y2) + margin;
        return `%%BoundingBox: ${newX1} ${newY1} ${newX2} ${newY2}`;
      }
    );

    const dir = path.join(__dirname, '../modified');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    modifiedFilePath = path.join(dir, `${Date.now()}_modified.eps`);
    fs.writeFileSync(modifiedFilePath, epsContent);
    modified = true;
  }

  return {
    type: 'EPS',
    width_mm,
    height_mm,
    modified,
    modifiedFilePath,
  };
}

module.exports = { analyzeEPS };
