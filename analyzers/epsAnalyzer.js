const fs = require('fs');

async function analyzeEPS(filePath) {
  const epsData = fs.readFileSync(filePath, 'utf8');

  const bboxMatch = epsData.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);

  if (!bboxMatch) {
    return { type: 'EPS', error: 'BoundingBox introuvable' };
  }

  const [xMin, yMin, xMax, yMax] = bboxMatch.slice(1).map(Number);
  const widthPt = xMax - xMin;
  const heightPt = yMax - yMin;

  // Extraction Artboard (plan de travail)
  const artboardMatch = epsData.match(/%%HiResBoundingBox: ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/);
  let artboardWidthPt = widthPt, artboardHeightPt = heightPt;

  if (artboardMatch) {
    const [axMin, ayMin, axMax, ayMax] = artboardMatch.slice(1).map(Number);
    artboardWidthPt = axMax - axMin;
    artboardHeightPt = ayMax - ayMin;
  }

  const pointsToMM = pt => pt * (25.4 / 72);

  const widthMM = pointsToMM(widthPt);
  const heightMM = pointsToMM(heightPt);
  const artboardWidthMM = pointsToMM(artboardWidthPt);
  const artboardHeightMM = pointsToMM(artboardHeightPt);

  // Comparaison sur valeurs ENTIÈRES
  const isSameWidth = Math.floor(widthMM) === Math.floor(artboardWidthMM);
  const isSameHeight = Math.floor(heightMM) === Math.floor(artboardHeightMM);

  let modified = false;
  let modifiedFilePath = null;

  if (isSameWidth && isSameHeight) {
    const marginPt = (2 / 25.4) * 72;
    const newXMin = xMin - marginPt;
    const newYMin = yMin - marginPt;
    const newXMax = xMax + marginPt;
    const newYMax = yMax + marginPt;

    const modifiedEPS = epsData.replace(
      /%%BoundingBox: \d+ \d+ \d+ \d+/,
      `%%BoundingBox: ${Math.round(newXMin)} ${Math.round(newYMin)} ${Math.round(newXMax)} ${Math.round(newYMax)}`
    );

    modifiedFilePath = `modified/${Date.now()}_modified.eps`;
    fs.writeFileSync(modifiedFilePath, modifiedEPS);
    modified = true;
  }

  return {
    type: 'EPS',
    width_mm: parseFloat(widthMM.toFixed(2)),
    height_mm: parseFloat(heightMM.toFixed(2)),
    modified,
    modifiedFilePath,
  };
}

module.exports = { analyzeEPS };

