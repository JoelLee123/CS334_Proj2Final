import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://icasllfpapgqgcjhydnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYXNsbGZwYXBncWdjamh5ZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxNjc0NjAsImV4cCI6MjA0Mjc0MzQ2MH0.XdC3QnmsVW1bwK59Ix6rlu4vSNAY5Ok9dTlpTuCjAt4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
