import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dxuzpgxbdmugyqchseza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXpwZ3hiZG11Z3lxY2hzZXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTE2MDQsImV4cCI6MjA4OTQyNzYwNH0.CHBaWrpxxEqCs-wrVBA_Yv1XY48G6O-kGxWrriUA7Rc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
