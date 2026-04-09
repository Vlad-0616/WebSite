import { Router } from 'express'
import supabase from '../lib/supabase.js'

const router = Router()

// GET /api/statistics/popular-routes - Популярные маршруты
router.get('/popular-routes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    // Получаем популярные маршруты из таблицы orders
    const { data: routes, error } = await supabase
      .from('orders')
      .select('pickup_address, delivery_address')
      .limit(100)

    if (error) {
      console.error('Error fetching popular routes:', error)
      return res.status(500).json({ message: 'Ошибка при получении статистики' })
    }

    // Группируем маршруты и считаем количество
    const routeCounts = {}
    routes.forEach(route => {
      const key = `${route.pickup_address} → ${route.delivery_address}`
      if (!routeCounts[key]) {
        routeCounts[key] = {
          from: route.pickup_address.split(',')[0].trim(),
          to: route.delivery_address.split(',')[0].trim(),
          count: 0
        }
      }
      routeCounts[key].count++
    })

    // Сортируем и берём топ
    const sortedRoutes = Object.values(routeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((route, index) => ({ id: index + 1, ...route }))

    res.json(sortedRoutes)
  } catch (error) {
    console.error('Popular routes error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
