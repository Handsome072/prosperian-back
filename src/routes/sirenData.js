const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

router.get('/preview', async (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, '../../public/sirenData/StockUniteLegale_utf8.csv');
  let headers = [];
  let rowCount = 0;
  try {
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (h) => {
        headers = h;
      })
      .on('data', (data) => {
        if (rowCount < 12) {
          results.push(data);
          rowCount++;
          if (rowCount === 12) {
            stream.destroy(); // Arrête la lecture dès qu'on a 12 lignes
            res.json({ columns: headers, rows: results });
          }
        }
      })
      .on('end', () => {
        // Si le fichier a moins de 12 lignes, on répond ici
        if (rowCount < 12) {
          res.json({ columns: headers, rows: results });
        }
      })
      .on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erreur lors de la lecture du CSV', details: err.message });
        }
      });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors de la lecture du fichier', details: err.message });
    }
  }
});

module.exports = router; 