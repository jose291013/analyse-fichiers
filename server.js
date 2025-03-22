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

app.post('/analyze', upload.single('FILE'), async (req, res) => {
  try {
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    let result;
    if (ext === '.svg') {
      result = await svgAnalyzer.analyze(file.path);
    } else if (ext === '.eps') {
      result = await epsAnalyzer.analyze(file.path);
    } else {
      return res.status(400).json({ error: 'Fichier non supporté' });
    }

    fs.unlinkSync(file.path); // nettoyer
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en ligne sur le port ${port}`);
});
