import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  phone: z.string().min(7, 'Некорректный номер телефона').optional(),
  role: z.enum(['shipper', 'carrier']).optional().default('shipper')
})

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль')
})

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body)
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
