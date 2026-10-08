// LegacyDirect's own Supabase project (separate from PaceLedger).
//
// Paste the two values from Supabase → Project Settings → API:
//   - Project URL
//   - "anon" / "publishable" key
// The anon key is meant to be public. The leads table only allows the
// website to ADD leads — it can't read, edit or delete them.
export const SUPABASE_URL = 'https://cestkzdytaqtrhuaxski.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlc3RremR5dGFxdHJodWF4c2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Njk1NzAsImV4cCI6MjEwNzA0NTU3MH0.op3_nX10oqHNSWgP9ZbGRafxpbYg361NqUnQKZj2YfY';

export const leadsConfigured =
  SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('PASTE_');
