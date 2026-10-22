// scripts/seed-supabase.js
// Seeds the 561 initial records from db.json into Supabase table public.we_records

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fzdmdvgmorzifysygkhp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_J-ecQDFtFrIXGPP3caANTw_lup9wJay';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const dbPath = join(__dirname, '..', 'server', 'data', 'db.json');
  if (!existsSync(dbPath)) {
    console.error('❌ db.json not found at:', dbPath);
    process.exit(1);
  }

  const raw = readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(raw);
  const records = db.records || [];

  console.log(`🚀 Found ${records.length} records to seed into Supabase...`);

  // Clear existing records if any
  const { error: delError } = await supabase.from('we_records').delete().neq('site_code', '___NEVER___');
  if (delError) {
    console.warn('⚠️ Could not clear existing rows:', delError.message);
  }

  // Format rows for Supabase (relational columns + complete jsonb payload)
  const rows = records.map(r => {
    return {
      site_code: r['site code'] || '',
      'site code': r['site code'] || '',
      'Exc Sectores': r['Exc Sectores'] || '',
      'Sectores': r['Sectores'] || '',
      'Exc sector': r['Exc sector'] || '',
      'Sectore': r['Sectore'] || '',
      'Exc Zone': r['Exc Zone'] || '',
      'Zone': r['Zone'] || '',
      'Type': r['Type'] || '',
      'Site Status': r['Site Status'] || '',
      'NLongitude': r['NLongitude'] || '',
      'NLatitude': r['NLatitude'] || '',
      data: r,
    };
  });

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('we_records').insert(batch);
    if (error) {
      console.error(`❌ Batch ${i + 1} - ${i + batch.length} failed:`, error.message);
    } else {
      console.log(`✅ Uploaded batch ${i + 1} to ${Math.min(i + BATCH_SIZE, rows.length)} of ${rows.length}`);
    }
  }

  // Verify total count
  const { data: countData, error: countErr } = await supabase
    .from('we_records')
    .select('id');

  if (!countErr && countData) {
    console.log(`🎉 Seeding complete! Total records in Supabase: ${countData.length}`);
  }
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
