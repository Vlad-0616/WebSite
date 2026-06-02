//утилита для безопаности аунтентификации
import jwt from 'jsonwebtoken'

//генерирует новый JWT токен для аутентифицированного пользователя
export function generateToken(payload) {
  // jwt.sign() создает подписанный токен; payload - данные для шифрования
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' //токен действителен 7 дней (7 days)                
  })
}

//проверяет и расшифровывает JWT токен
export function verifyToken(token) {
  //jwt.verify() проверяет подпись токена и расшифровывает payload
  return jwt.verify(token, process.env.JWT_SECRET)
}
