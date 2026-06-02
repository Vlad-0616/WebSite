import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'        
import orderRoutes from './routes/order.routes.js'    
import statisticsRoutes from './routes/statistics.routes.js' 
import truckRoutes from './routes/truck.routes.js'      

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/trucks', truckRoutes)
app.use('/api/statistics', statisticsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()  
  })
})

app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Доступные эндпоинты:`)
  console.log(`   - POST   /api/auth/login`)
  console.log(`   - POST   /api/auth/register`)
  console.log(`   - GET    /api/orders`)
  console.log(`   - GET    /api/trucks`)
  console.log(`   - GET    /api/health`)

  if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist')
    app.use(express.static(frontendPath))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next()
      } else {
        res.sendFile(path.join(frontendPath, 'index.html'))
      }
    })
  }
})

export default app
