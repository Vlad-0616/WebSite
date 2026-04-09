import { Router } from 'express'
import bcrypt from 'bcrypt'
import supabase from '../lib/supabase.js'
import { generateToken } from '../lib/jwt.js'
import { registerSchema, loginSchema, validateBody } from '../validators/auth.validator.js'
import { authenticateToken } from '../middleware/auth.middleware.js'

const router = Router()

// POST /api/auth/register - Регистрация
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role } = req.validatedBody

    // Проверяем существует ли пользователь
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    // Хешируем пароль
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Создаем пользователя
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name,
        phone: req.validatedBody.phone || null,
        role: role || 'shipper'
      })
      .select('id, email, name, phone, role, created_at')
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return res.status(500).json({ message: 'Ошибка при создании пользователя' })
    }

    // Генерируем токен
    const token = generateToken({ userId: user.id, email: user.email })

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      access_token: token
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
})

// POST /api/auth/login - Вход
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody

    // Ищем пользователя
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
        role: user.role
      },
      access_token: token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Ошибка сервера при входе' })
  }
})

// GET /api/auth/me - Текущий пользователь
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user

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

export default router
