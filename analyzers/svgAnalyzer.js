// analyzers/svgAnalyzer.js
const fs = require('fs');
const { parseStringPromise } = require('xml2js');

async function analyze(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const result = await parseStringPromise(data);
  
    const svg = result.svg.$;
    const width = parseFloat(svg.width) || 0;
    const height = parseFloat(svg.height) || 0;
  
    return {
      type: 'SVG',
      width,
      height,
      unit: 'px'
    };
  }
  
  module.exports = { analyze };
  
