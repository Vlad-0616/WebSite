import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Check your .env file. SUPABASE_URL: ' + process.env.SUPABASE_URL)
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
