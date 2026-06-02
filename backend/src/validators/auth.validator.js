import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Пароль должен быть не менее 8 символов')
  .max(16, 'Пароль должен быть не более 16 символов')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Пароль должен содержать хотя бы один специальный символ')


export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  phone: z.string().min(7, 'Некорректный номер телефона').optional(),
  role: z.enum(['shipper', 'carrier']).optional().default('shipper'),
  secretWord: z.string().min(2, 'Кодовое слово должно быть не менее 2 символов'),
  hintQuestion: z.string().min(3, 'Подсказка должна быть не менее 3 символов')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль')
})

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Парсим тело запроса через Zod-схему
      const result = schema.parse(req.body)
      // Сохраняем валидированные данные
      req.validatedBody = result
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(e => e.message)
        return res.status(400).json({
          message: 'Ошибка валидации',
          errors: messages
        })
      }
      next(error)
    }
  }
}

// Схема для запроса подсказки (Шаг 1 восстановления)
export const requestRecoverSchema = z.object({
  email: z.string().email('Некорректный email')
})

// Схема для проверки кодового слова (Шаг 2 восстановления)
export const verifySecretWordSchema = z.object({
  email: z.string().email('Некорректный email'),
  secretWord: z.string().min(1, 'Введите кодовое слово')
})

// Схема для сброса пароля (Шаг 3 восстановления)
export const resetPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
  secretWord: z.string().min(1, 'Кодовое слово потеряно'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Подтвердите пароль')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
})
