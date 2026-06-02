//Middleware для проверки JWT токена и аутентификации пользователя
import { verifyToken } from '../lib/jwt.js'
import supabase from '../lib/supabase.js'

export async function authenticateToken(req, res, next) {
  try {
    //Получаем токен из заголовка Authorization
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]  
    //Если токена нет - пользователь не авторизован
    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' })
    }
    //Проверяем и расшифровываем токен
    const decoded = verifyToken(token)
    //Получаем актуальные данные пользователя из базы
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', decoded.userId)  // Ищем по id из токена
      .single() // Ожидаем только одного пользователя

    //Если пользователь не найден или ошибка БД
    if (error || !user) {
      return res.status(401).json({ message: 'Недействительный токен' })
    }

    //Сохраняем пользователя в объект запроса для доступа в других middleware/route
    req.user = user 
    //Передаем управление дальше
    next()
  } catch (error) {
    //Ошибка при верификации токена (просрочен, неверная подпись и т.д.)
    return res.status(403).json({ message: 'Неверный токен' })
  }
}
