import 'dotenv/config';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key || key.includes('PASTE_YOUR')) {
  throw new Error('Supabase credentials missing in .env');
}

const db = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
const supabase = createClient(url, key);

const { data: existing, error: readError } = await supabase
  .from('studio_database')
  .select('id')
  .eq('id', 1)
  .maybeSingle();

if (readError) throw readError;
if (existing) throw new Error('Supabase row already exists; refusing to overwrite.');

const { error } = await supabase
  .from('studio_database')
  .insert({ id: 1, data: db });

if (error) throw error;

const { data: check, error: verifyError } = await supabase
  .from('studio_database')
  .select('id, data')
  .eq('id', 1)
  .single();

if (verifyError) throw verifyError;

console.log('Migration successful.');
console.log('Services:', check.data.services?.length ?? 0);
console.log('Bookings:', check.data.bookings?.length ?? 0);
console.log('Inquiries:', check.data.inquiries?.length ?? 0);
