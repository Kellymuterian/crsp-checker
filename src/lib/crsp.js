import * as XLSX from "xlsx";
import path from "path";

const CACHE_TTL_MS = 300000;

let crspDataCache = null;
let lastLoadTime = 0;

function loadCrspData() {
  const filePath = path.join(process.cwd(), "data", "crsp.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { range: 1 });
}

export function getAllVehicles() {
  const now = Date.now();
  if (!crspDataCache || now - lastLoadTime > CACHE_TTL_MS) {
    crspDataCache = loadCrspData();
    lastLoadTime = now;
  }
  return crspDataCache;
}
