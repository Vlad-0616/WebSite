import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import orderRoutes from './routes/order.routes.js'
import statisticsRoutes from './routes/statistics.routes.js'

const app = express()
const PORT = process.env.PORT || 3000
