// analyzers/epsAnalyzer.js
const fs = require('fs');

function ptToMm(pt) {
  return (pt * 25.4) / 72;
}

function mmToPt(mm) {
  return (mm * 72) / 25.4;
}

async function analyzeEPS(filePath) {
  const epsContent = fs.readFileSync(filePath, 'utf8');
  const bboxMatch = epsContent.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);

  if (!bboxMatch) {
    return { error: 'BoundingBox introuvable' };
  }

  let [xMin, yMin, xMax, yMax] = bboxMatch.slice(1).map(Number);
  let width = xMax - xMin;
  let height = yMax - yMin;

  let widthMm = ptToMm(width);
  let heightMm = ptToMm(height);

  const artboardMatch = epsContent.match(/%%HiResBoundingBox: (\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*)/);
  let artboardMatchesContent = false;

  if (artboardMatch) {
    let [axMin, ayMin, axMax, ayMax] = artboardMatch.slice(1).map(Number);
    artboardMatchesContent = (axMin === xMin && ayMin === yMin && axMax === xMax && ayMax === yMax);
  }

  let modifiedFilePath = null;

  if (artboardMatchesContent) {
    // Ajouter 2 mm (convertis en points)
    const extraMarginPt = mmToPt(2);
    xMin -= extraMarginPt;
    yMin -= extraMarginPt;
    xMax += extraMarginPt;
    yMax += extraMarginPt;

    const modifiedEPS = epsContent.replace(
      /(%%BoundingBox: )(\d+) (\d+) (\d+) (\d+)/,
      `$1${Math.floor(xMin)} ${Math.floor(yMin)} ${Math.ceil(xMax)} ${Math.ceil(yMax)}`
    );

    // Sauvegarde du fichier modifié
    modifiedFilePath = `modified/${Date.now()}_modified.eps`;
    fs.writeFileSync(modifiedFilePath, modifiedEPS, 'utf8');
  }

  return {
    type: 'EPS',
    width_mm: +widthMm.toFixed(2),
    height_mm: +heightMm.toFixed(2),
    modified: artboardMatchesContent,
    modifiedFilePath
  };
}

module.exports = { analyzeEPS };
