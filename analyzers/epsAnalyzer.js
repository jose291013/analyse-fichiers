const fs = require('fs');

async function analyzeEPS(filePath) {
  const epsData = fs.readFileSync(filePath, 'utf8');
  const boundingBoxLine = epsData.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);

  if (!boundingBoxLine) throw new Error("BoundingBox introuvable.");

  const [_, x1, y1, x2, y2] = boundingBoxLine.map(Number);

  const width = x2 - x1;
  const height = y2 - y1;

  const mmPerPoint = 25.4 / 72; // 1 point EPS = 1/72 inch

  return {
    type: 'EPS',
    boundingBox: { x1, y1, x2, y2 },
    width_mm: +(width * mmPerPoint).toFixed(2),
    height_mm: +(height * mmPerPoint).toFixed(2),
    unit: 'mm',
  };
}

module.exports = { analyzeEPS };
