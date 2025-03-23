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

// Route EPS avec analyse + modification fichier
app.post('/analyze-eps', upload.single('FILE'), async (req, res) => {
  try {
    const file = req.file;

    // Analyse les dimensions actuelles du EPS
    const dimensions = await epsAnalyzer.analyzeEPS(file.path);

    // Modifie l'EPS (ajoute 2mm si nécessaire)
    const modifiedFilePath = await epsAnalyzer.modifyEPS(file.path);

    // Envoie simultanément les dimensions et le fichier modifié
    res.json({
      dimensions,
      downloadLink: `/download/${path.basename(modifiedFilePath)}`
    });

    // Supprime l'EPS original après traitement (garde modifié temporairement)
    fs.unlinkSync(file.path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route pour télécharger le fichier EPS modifié
app.get('/download/:fileName', (req, res) => {
  const filePath = path.join(__dirname, 'modified', req.params.fileName);

  res.download(filePath, 'modified-file.eps', (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
    } else {
      fs.unlinkSync(filePath); // Nettoyage après téléchargement
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur en ligne sur le port ${port}`);
});
