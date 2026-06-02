import { verifyToken } from '../lib/jwt.js'
import supabase from '../lib/supabase.js'

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1] 

    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' })
    }

    const decoded = verifyToken(token)
    
    // Получаем пользователя из БД
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ message: 'Недействительный токен' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Неверный токен' })
  }
}
