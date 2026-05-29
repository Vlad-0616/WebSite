import dotenv from 'dotenv'
dotenv.config() // Загружаем переменные в process.env

import express from 'express' // Основной фреймворк для HTTP сервера
import cors from 'cors' // Middleware для CORS (Cross-Origin Resource Sharing)
import helmet from 'helmet' // Middleware для безопасности HTTP заголовков

//Импорт маршрутов  из отдельных файлов
import authRoutes from './routes/auth.routes.js'        
import orderRoutes from './routes/order.routes.js'    
import statisticsRoutes from './routes/statistics.routes.js' 
import truckRoutes from './routes/truck.routes.js'      

//Создание экземпляра Express приложения
const app = express()

const PORT = process.env.PORT || 3000

//Middleware - это функции, которые выполняются между запросом и ответом
//Helmet - защита HTTP заголовков
app.use(helmet())

//управление кросс-доменными запросами CORS разрешает или запрещает запросы с других доменов
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',  // Разрешить запросы только с этого источника
  credentials: true  // Разрешить отправку cookies и Authorization заголовка (JWT токена)
}))

//Преобразует входящие JSON данные в JavaScript объект (req.body)
app.use(express.json())

// Маршруты аутентификации: /api/auth/login, /api/auth/register, /api/auth/me
app.use('/api/auth', authRoutes)

// Маршруты заказов: /api/orders, /api/orders/:id, /api/orders/my
app.use('/api/orders', orderRoutes)

// Маршруты транспорта: /api/trucks, /api/trucks/my, /api/trucks/types
app.use('/api/trucks', truckRoutes)

// Маршруты статистики: /api/statistics/popular-routes
app.use('/api/statistics', statisticsRoutes)

//Health Check эндпоинт - проверка работоспособности сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', // Всегда 'ok' если сервер жив
    timestamp: new Date().toISOString()  
  })
})

//Глобальный обработчик ошибок 
app.use((err, req, res, next) => {
  // Логируем ошибку в консоль для отладки
  console.error(' Ошибка сервера:', err.stack)
  // Отправляем ответ клиенту
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error' //Текст ошибки или стандартное сообщение
  })
})

//Запуск HTTP сервера на указанном порту
app.listen(PORT, () => {
  // Информация о запуске сервера
  console.log(` Сервер запущен на http://localhost:${PORT}`)
  console.log(` Режим: ${process.env.NODE_ENV || 'development'}`)
  console.log(` Доступные эндпоинты:`)
  console.log(`   - POST   /api/auth/login`)
  console.log(`   - POST   /api/auth/register`)
  console.log(`   - GET    /api/orders`)
  console.log(`   - GET    /api/trucks`)
  console.log(`   - GET    /api/health`)
})
export default app