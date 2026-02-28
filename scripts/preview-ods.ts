import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const odsPath = path.join(process.cwd(), 'Leads.ods');

if (!fs.existsSync(odsPath)) {
  console.error('Leads.ods file not found at:', odsPath);
  process.exit(1);
}

console.log('Reading Leads.ods...\n');

const workbook = xlsx.readFile(odsPath);

console.log('Sheet names:', workbook.SheetNames);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });

console.log('\n=== First 10 rows (including headers) ===\n');
data.slice(0, 10).forEach((row, index) => {
  console.log(`Row ${index}:`, row);
});

console.log('\n=== Total rows:', data.length);
console.log('=== Total columns:', (data[0] as any[])?.length || 0);
