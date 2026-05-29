import { Router } from 'express'
import bcrypt from 'bcrypt'
import supabase from '../lib/supabase.js'
import { generateToken } from '../lib/jwt.js'
import { registerSchema, loginSchema, validateBody } from '../validators/auth.validator.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { requestRecoverSchema, verifySecretWordSchema, resetPasswordSchema } from '../validators/auth.validator.js'

const router = Router()

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role, secretWord, hintQuestion } = req.validatedBody
    // Проверяем, не занят ли email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }
    // Хешируем пароль и кодовое слово
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const secretWordHash = await bcrypt.hash(secretWord.toLowerCase().trim(), saltRounds)

    // Создаем пользователя в БД
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name,
        phone: req.validatedBody.phone || null,
        role: role || 'shipper',
        hint_question: hintQuestion,
        secret_word_hash: secretWordHash
      })
      .select('id, email, name, phone, role, created_at')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return res.status(500).json({ message: 'Ошибка при создании пользователя' })
    }

    //генерируем JWT токен для автоматического входа после регистрации
    const token = generateToken({ userId: user.id, email: user.email })
    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      },
      access_token: token
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
})

// POST /api/auth/login - Вход в аккаунт
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody
    // Ищем пользователя по email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }
    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' })
    }
    // Генерируем токен
    const token = generateToken({ userId: user.id, email: user.email })
    res.json({
      message: 'Вход выполнен',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      },
      access_token: token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Ошибка сервера при входе' })
  }
})

// POST /api/auth/logout - Выход (просто удаляем токен на клиенте)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Выход выполнен' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Ошибка при выходе' })
  }
})

// GET /api/auth/me - Получить данные текущего авторизованного пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user  // Уже добавлен middleware authenticateToken
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Ошибка при получении данных пользователя' })
  }
})

//Запрос подсказки по email
router.post('/recover/request', validateBody(requestRecoverSchema), async (req, res) => {
  try {
    const { email } = req.validatedBody

    const { data: user, error } = await supabase
      .from('users')
      .select('hint_question')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(444).json({ message: 'Пользователь с таким email не найден' })
    }
    //возвращаем подсказку для кодового слова
    res.json({ hint_question: user.hint_question })
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

//Проверка кодового слова
router.post('/recover/verify', validateBody(verifySecretWordSchema), async (req, res) => {
  try {
    const { email, secretWord } = req.validatedBody

    const { data: user, error } = await supabase
      .from('users')
      .select('secret_word_hash')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    //сравниваем кодовое слово (регистронезависимо)
    const isValid = await bcrypt.compare(secretWord.toLowerCase().trim(), user.secret_word_hash)
    if (!isValid) {
      return res.status(400).json({ message: 'Неверное кодовое слово' })
    }
    res.json({ message: 'Кодовое слово верно' })
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

//Установка нового пароля
router.post('/recover/reset', validateBody(resetPasswordSchema), async (req, res) => {
  try {
    const { email, secretWord, password } = req.validatedBody
    //Повторно проверяем кодовое слово для безопасности
    const { data: user, error } = await supabase
      .from('users')
      .select('secret_word_hash')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    const isValid = await bcrypt.compare(secretWord.toLowerCase().trim(), user.secret_word_hash)
    if (!isValid) {
      return res.status(400).json({ message: 'Ошибка безопасности. Неверное кодовое слово' })
    }
    //Хешируем новый пароль и обновляем в БД
    const passwordHash = await bcrypt.hash(password, 10)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)

    if (updateError) {
      return res.status(500).json({ message: 'Не удалось обновить пароль' })
    }

    res.json({ message: 'Пароль успешно изменен' })
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
