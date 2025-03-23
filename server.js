// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const svgAnalyzer = require('./analyzers/svgAnalyzer');
const epsAnalyzer = require('./analyzers/epsAnalyzer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const upload = multer({ dest: 'uploads/' });

// Route existante pour analyser SVG/EPS
app.post('/analyze', upload.single('FILE'), async (req, res) => {
  try {
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    let result;
    if (ext === '.svg') {
      result = await svgAnalyzer.analyzeSVG(file.path);
    } else if (ext === '.eps') {
      result = await epsAnalyzer.analyzeEPS(file.path);
    } else {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Fichier non supporté' });
    }

    fs.unlinkSync(file.path);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ✅ Nouvelle route pour modifier EPS (ajout marge 2mm)
app.post('/modify-eps', upload.single('FILE'), async (req, res) => {
  try {
    const file = req.file;
    const filePath = file.path;
    const epsData = fs.readFileSync(filePath, 'utf8');

    const boundingBoxLine = epsData.match(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/);
    if (!boundingBoxLine) throw new Error("BoundingBox introuvable.");

    const [_, x1, y1, x2, y2] = boundingBoxLine.map(Number);

    // 2 mm en points EPS (~5.67 points)
    const marginPoints = (2 * 72) / 25.4;

    const newBoundingBox = {
      x1: x1 - marginPoints,
      y1: y1 - marginPoints,
      x2: x2 + marginPoints,
      y2: y2 + marginPoints,
    };

    const newBoundingBoxLine = `%%BoundingBox: ${Math.floor(newBoundingBox.x1)} ${Math.floor(newBoundingBox.y1)} ${Math.ceil(newBoundingBox.x2)} ${Math.ceil(newBoundingBox.y2)}`;

    const modifiedEpsData = epsData.replace(/%%BoundingBox: (\d+) (\d+) (\d+) (\d+)/, newBoundingBoxLine);

    const newFilePath = filePath + '-modified.eps';
    fs.writeFileSync(newFilePath, modifiedEpsData, 'utf8');

    res.download(newFilePath, 'modified-file.eps', (err) => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(newFilePath);
      if (err) throw err;
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en ligne sur le port ${port}`);
});