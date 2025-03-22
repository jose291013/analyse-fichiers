// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { analyzeSVG } = require('./analyzers/svgAnalyzer');
const { analyzeEPS } = require('./analyzers/epsAnalyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup de multer
const upload = multer({ dest: 'uploads/' });

// Endpoint d'analyse de fichiers
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname).toLowerCase();

    let result;

    if (extension === '.svg') {
      result = await analyzeSVG(filePath);
    } else if (extension === '.eps') {
      result = await analyzeEPS(filePath);
    } else {
      return res.status(400).json({ error: 'Format non pris en charge.' });
    }

    // Nettoyage
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l’analyse.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
