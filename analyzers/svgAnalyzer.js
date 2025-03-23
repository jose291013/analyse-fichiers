// analyzers/svgAnalyzer.js
const fs = require('fs');
const { parse } = require('svgson');
const getBounds = require('svg-path-bounding-box');

async function analyzeSVG(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const svgJSON = await parse(data);

  let globalBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  const traverse = (node) => {
    if (node.name === 'path' && node.attributes.d) {
      const bounds = getBounds(node.attributes.d);
      globalBounds.minX = Math.min(globalBounds.minX, bounds.minX);
      globalBounds.minY = Math.min(globalBounds.minY, bounds.minY);
      globalBounds.maxX = Math.max(globalBounds.maxX, bounds.maxX);
      globalBounds.maxY = Math.max(globalBounds.maxY, bounds.maxY);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  traverse(svgJSON);

  if (globalBounds.minX === Infinity) {
    return { error: "Aucun chemin vectoriel détecté." };
  }

  const widthPx = globalBounds.maxX - globalBounds.minX;
  const heightPx = globalBounds.maxY - globalBounds.minY;

  const dpi = 96;
  const mm_per_inch = 25.4;

  return {
    type: 'SVG',
    width_mm: parseFloat(((widthPx / dpi) * mm_per_inch).toFixed(2)),
    height_mm: parseFloat(((heightPx / dpi) * mm_per_inch).toFixed(2)),
    unit: 'mm'
  };
}

module.exports = { analyzeSVG };


  
