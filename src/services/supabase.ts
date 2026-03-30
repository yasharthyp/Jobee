import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const SUPABASE_URL = 'https://vqtmajorvjvfyfaeuudi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdG1ham9ydmp2ZnlmYWV1dWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzE0MDIsImV4cCI6MjA4NjU0NzQwMn0.9io65nrOzEurdhQugL_U6W3uQLQNIusAuRDbtR3YFsY';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
