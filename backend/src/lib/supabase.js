import dotenv from 'dotenv'
dotenv.config()  // Загружаем переменные из .env файла

import { createClient } from '@supabase/supabase-js'
// Получаем credentials из переменных окружения
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
// Проверяем, что credentials заданы (иначе сервер не запустится)
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Check your .env file. SUPABASE_URL: ' + process.env.SUPABASE_URL)
}
// Создаем и экспортируем клиент Supabase для использования в других файлах
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
