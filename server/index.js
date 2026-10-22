// server/index.js
// Central backend server: Express + lowdb (JSON file persistence)
// Provides REST API for the WE data entry system
// Single source of truth for all users

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Database file path ──
const DB_PATH = join(__dirname, 'data', 'db.json');
const CSV_PATH = join(__dirname, 'data', 'We.csv');

// ── Simple JSON database helper ──
function readDB() {
  if (!existsSync(DB_PATH)) {
    return { records: [], metadata: { lastUpdated: null, totalImported: 0 } };
  }
  const raw = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ── Parse CSV manually (avoid complex deps) ──
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    // Add unique ID and metadata
    record['_id'] = randomUUID();
    record['_createdAt'] = new Date().toISOString();
    record['_updatedAt'] = new Date().toISOString();
    record['_createdBy'] = 'system-import';
    records.push(record);
  }
  return records;
}

// ── Import CSV on first run ──
function initializeDB() {
  const db = readDB();
  if (db.records.length === 0 && existsSync(CSV_PATH)) {
    console.log('🔄 Importing We.csv into central database...');
    const csvText = readFileSync(CSV_PATH, 'utf-8');
    const records = parseCSV(csvText);
    db.records = records;
    db.metadata = {
      lastUpdated: new Date().toISOString(),
      totalImported: records.length,
    };
    writeDB(db);
    console.log(`✅ Imported ${records.length} records from We.csv`);
  } else {
    console.log(`📊 Database has ${db.records.length} records`);
  }
}

// ───────────────────────────────────────────
// API ROUTES
// ───────────────────────────────────────────

// GET /api/records — Return all records (central master dataset)
app.get('/api/records', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    count: db.records.length,
    records: db.records,
    metadata: db.metadata,
  });
});

// GET /api/records/:siteCode — Get a single record by site code
app.get('/api/records/:siteCode', (req, res) => {
  const db = readDB();
  const siteCode = req.params.siteCode;
  const record = db.records.find(r => r['site code'] === siteCode);
  if (!record) {
    return res.status(404).json({ success: false, error: `Site code "${siteCode}" not found` });
  }
  res.json({ success: true, record });
});

// GET /api/site-codes — Return all unique site codes for the search/select
app.get('/api/site-codes', (req, res) => {
  const db = readDB();
  const codes = [...new Set(db.records.map(r => r['site code']).filter(Boolean))].sort();
  res.json({ success: true, codes });
});

// GET /api/dropdown-values/:column — Return distinct values for a green (dropdown) column
// Supports optional filter query params to enable cascading
app.get('/api/dropdown-values/:column', (req, res) => {
  const db = readDB();
  const column = req.params.column;
  let filtered = db.records;

  // Apply cascading filters from query params
  const filterParams = req.query;
  for (const [key, value] of Object.entries(filterParams)) {
    if (value && key !== 'column') {
      filtered = filtered.filter(r => r[key] === value);
    }
  }

  const values = [...new Set(filtered.map(r => r[column]).filter(Boolean))].sort();
  res.json({ success: true, column, values });
});

// POST /api/records — Add or update a record
app.post('/api/records', (req, res) => {
  const db = readDB();
  const newRecord = req.body;

  if (!newRecord['site code']) {
    return res.status(400).json({ success: false, error: 'Site code is required' });
  }

  // Check for duplicates (site code + activity key)
  const siteCode = newRecord['site code'];
  const activity = newRecord['التصنيف'] || '';
  const dateWeek = newRecord['التاريخ المتوقع للانتهاء'] || '';

  const existingIdx = db.records.findIndex(r =>
    r['site code'] === siteCode &&
    r['التصنيف'] === activity &&
    r['التاريخ المتوقع للانتهاء'] === dateWeek
  );

  if (existingIdx !== -1 && !newRecord._forceUpdate) {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_RECORD',
      message: `سجل مكرر: الموقع ${siteCode} بالتصنيف "${activity}" موجود بالفعل`,
      existingRecord: db.records[existingIdx],
    });
  }

  if (existingIdx !== -1 && newRecord._forceUpdate) {
    // Update existing record
    delete newRecord._forceUpdate;
    const updated = {
      ...db.records[existingIdx],
      ...newRecord,
      _updatedAt: new Date().toISOString(),
      _updatedBy: newRecord._createdBy || 'user',
    };
    db.records[existingIdx] = updated;
    db.metadata.lastUpdated = new Date().toISOString();
    writeDB(db);
    return res.json({
      success: true,
      action: 'updated',
      record: updated,
      message: 'تم تحديث السجل بنجاح',
    });
  }

  // Add new record
  const record = {
    ...newRecord,
    _id: randomUUID(),
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _createdBy: newRecord._createdBy || 'user',
  };
  delete record._forceUpdate;

  db.records.push(record);
  db.metadata.lastUpdated = new Date().toISOString();
  writeDB(db);

  res.status(201).json({
    success: true,
    action: 'created',
    record,
    message: 'تم إضافة السجل بنجاح',
  });
});

// PUT /api/records/:id — Update a record by its _id
app.put('/api/records/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const idx = db.records.findIndex(r => r._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  db.records[idx] = {
    ...db.records[idx],
    ...req.body,
    _updatedAt: new Date().toISOString(),
  };
  db.metadata.lastUpdated = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, record: db.records[idx], message: 'تم تحديث السجل بنجاح' });
});

// DELETE /api/records/:id — Delete a record
app.delete('/api/records/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const idx = db.records.findIndex(r => r._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  db.records.splice(idx, 1);
  db.metadata.lastUpdated = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, message: 'تم حذف السجل بنجاح' });
});

// GET /api/export/csv — Export the full dataset as CSV
app.get('/api/export/csv', (req, res) => {
  const db = readDB();
  if (db.records.length === 0) {
    return res.status(404).json({ success: false, error: 'No records to export' });
  }

  // Use the CSV columns (exclude internal fields)
  const internalFields = ['_id', '_createdAt', '_updatedAt', '_createdBy', '_updatedBy'];
  const allKeys = Object.keys(db.records[0]).filter(k => !internalFields.includes(k));

  let csv = allKeys.join(',') + '\n';
  for (const rec of db.records) {
    const row = allKeys.map(k => {
      const val = (rec[k] || '').toString().replace(/,/g, '،'); // Replace commas in values
      return val;
    });
    csv += row.join(',') + '\n';
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="we_master_data_export.csv"');
  // Add BOM for Excel Arabic support
  res.send('\uFEFF' + csv);
});

// GET /api/stats — Dashboard statistics
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const records = db.records;
  const totalSites = records.length;

  // Status breakdown
  const statusCounts = {};
  records.forEach(r => {
    const status = r['التصنيف'] || r['Site Status'] || 'غير محدد';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Sector breakdown
  const sectorCounts = {};
  records.forEach(r => {
    const sector = r['Sectore'] || 'غير محدد';
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
  });

  // Zone breakdown
  const zoneCounts = {};
  records.forEach(r => {
    const zone = r['Zone'] || 'غير محدد';
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
  });

  res.json({
    success: true,
    stats: {
      totalSites,
      statusCounts,
      sectorCounts,
      zoneCounts,
      lastUpdated: db.metadata.lastUpdated,
    },
  });
});

// ── Start server ──
initializeDB();
app.listen(PORT, () => {
  console.log(`🚀 WE Central API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/stats`);
  console.log(`📋 Records API: http://localhost:${PORT}/api/records`);
  console.log(`📥 Export CSV: http://localhost:${PORT}/api/export/csv`);
});
