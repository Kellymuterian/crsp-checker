import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// Cache the data outside the handler
let crspDataCache = null;
let lastLoadTime = 0;

async function loadCrspData() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, 'crsp.xlsx');
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { range: 1 });
}

export default async function handler(req, res) {
  const { make, model } = req.query;

  if (!make) {
    return res.status(400).json({ error: 'Make is required' });
  }

  // Cache with 5-minute freshness (adjust as needed)
  const now = Date.now();
  if (!crspDataCache || now - lastLoadTime > 300000) {
    crspDataCache = await loadCrspData();
    lastLoadTime = now;
  }

  const searchMake = make.toLowerCase();
  const searchModel = model?.toLowerCase();
  
  // Pre-process data for faster searching
  const results = crspDataCache.filter(item => {
    const itemMake = item.Make?.toLowerCase();
    if (!itemMake.includes(searchMake)) return false;
    
    if (searchModel) {
      const itemModel = item.Model?.toLowerCase();
      return itemModel.includes(searchModel);
    }
    return true;
  });

  res.status(200).json(results.slice(0, 20));
}