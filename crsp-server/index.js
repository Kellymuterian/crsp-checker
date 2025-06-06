const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// Load and parse the Excel file
function loadCRSPData() {
  const workbook = XLSX.readFile(path.join(__dirname, 'crsp.xlsx'));
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { range: 1 }); // start from row 2
  return jsonData;
}

const crspData = loadCRSPData();

// search endpoint
app.get('/api/search', (req, res) => {
  const { make, model } = req.query;

  if (!make) {
    return res.status(400).json({ error: 'Make is required' });
  }

  const results = crspData.filter(item => {
    const matchesMake = item.Make?.toLowerCase().includes(make.toLowerCase());
    const matchesModel = model ? item.Model?.toLowerCase().includes(model.toLowerCase()) : true;
    return matchesMake && matchesModel;
  });

  // Optional: limit to top 20 results
  res.json(results.slice(0, 20));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
