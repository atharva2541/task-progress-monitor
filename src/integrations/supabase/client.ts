
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = 'https://wvkjzwrkubeztdyryciw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a2p6d3JrdWJlenRkeXJ5Y2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzA0MTksImV4cCI6MjA2NTkwNjQxOX0.6sHh3bi0ne4N5-Chgcl0h4-a3RZuKlRUbvmwnSsyY_M'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
