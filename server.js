// analyzers/epsAnalyzer.js
const fs = require('fs');
const path = require('path');

async function analyzeEPS(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');

  // Extraction du BoundingBox depuis EPS
  const bboxMatch = data.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);
  if (!bboxMatch) {
    throw new Error('BoundingBox introuvable dans EPS');
  }

  const [, x1, y1, x2, y2] = bboxMatch.map(Number);

  const widthPt = x2 - x1;
  const heightPt = y2 - y1;

  const width_mm = (widthPt * 25.4) / 72;
  const height_mm = (heightPt * 25.4) / 72;

  return {
    type: 'EPS',
    width_mm: +width_mm.toFixed(2),
    height_mm: +height_mm.toFixed(2),
  };
}

async function modifyEPS(filePath) {
  let data = fs.readFileSync(filePath, 'utf8');

  const bboxMatch = data.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);
  if (!bboxMatch) {
    throw new Error('BoundingBox introuvable dans EPS');
  }

  let [fullMatch, x1, y1, x2, y2] = bboxMatch;
  x1 = Number(x1);
  y1 = Number(y1);
  x2 = Number(x2);
  y2 = Number(y2);

  const widthPt = x2 - x1;
  const heightPt = y2 - y1;

  // Convertir points en millimètres
  const width_mm = (widthPt * 25.4) / 72;
  const height_mm = (heightPt * 25.4) / 72;

  const modifiedDir = path.join(__dirname, '..', 'modified');
  if (!fs.existsSync(modifiedDir)) fs.mkdirSync(modifiedDir);

  const modifiedFilePath = path.join(modifiedDir, `${Date.now()}_modified.eps`);

  // Vérifie si la taille correspond exactement (arrondi à l'entier)
  if (Math.round(width_mm) === width_mm && Math.round(height_mm) === height_mm) {
    const offsetPt = (2 * 72) / 25.4; // 2mm en points

    const newX1 = x1 - offsetPt;
    const newY1 = y1 - offsetPt;
    const newX2 = x2 + offsetPt;
    const newY2 = y2 + offsetPt;

    data = data.replace(
      fullMatch,
      `%%BoundingBox: ${Math.round(newX1)} ${Math.round(newY1)} ${Math.round(newX2)} ${Math.round(newY2)}`
    );

    fs.writeFileSync(modifiedFilePath, data, 'utf8');

    return modifiedFilePath;
  } else {
    // Si pas modifié, retourne null
    return null;
  }
}

module.exports = { analyzeEPS, modifyEPS };
