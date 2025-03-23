// analyzers/svgAnalyzer.js
// analyzers/svgAnalyzer.js
const fs = require('fs');
const { parseStringPromise } = require('xml2js');

async function analyzeSVG(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const result = await parseStringPromise(data);
  const svgAttrs = result.svg.$;

  let width = 0;
  let height = 0;
  let unit = 'px';

  // Fonction pour extraire valeur + unité
  const parseDimension = (dim) => {
    const match = dim.match(/^([\d.]+)([a-z%]*)$/i);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || 'px' };
    }
    return { value: 0, unit: 'px' };
  };

  if (svgAttrs.width && svgAttrs.height) {
    const w = parseDimension(svgAttrs.width);
    const h = parseDimension(svgAttrs.height);
    width = w.value;
    height = h.value;
    unit = w.unit;
  } else if (svgAttrs.viewBox) {
    // fallback : utiliser viewBox
    const viewBoxParts = svgAttrs.viewBox.split(/\s+/);
    if (viewBoxParts.length === 4) {
      width = parseFloat(viewBoxParts[2]);
      height = parseFloat(viewBoxParts[3]);
    }
  }

  return {
    type: 'SVG',
    width,
    height,
    unit
  };
}

module.exports = { analyzeSVG };

  
