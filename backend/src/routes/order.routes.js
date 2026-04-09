import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { authenticateToken } from '../middleware/auth.middleware.js'

const router = Router()

// GET /api/orders - Список заказов (публичный)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active', sort = 'latest' } = req.query

    let query = supabase
      .from('orders')
      .select('*, users!orders_shipper_id_fkey(name, email)', { count: 'exact' })
      .eq('status', status)

    // Сортировка
    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else if (sort === 'price_asc') {
      query = query.order('price', { ascending: true })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return res.status(500).json({ message: 'Ошибка при получении заказов' })
    }

    res.json({
      orders,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/orders/:id - Детали заказа (публичный)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, users!orders_shipper_id_fkey(name, email, phone)')
      .eq('id', id)
      .single()

    if (error || !order) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/orders - Создание заказа (только авторизованным)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      pickup_address,
      delivery_address,
      weight_kg,
      volume_m3,
      truck_type,
      loading_type,
      price,
      currency,
      loading_date,
      description
    } = req.body

    // Валидация обязательных полей
    if (!pickup_address || !delivery_address || !weight_kg || !price) {
      return res.status(400).json({ 
        message: 'Заполните обязательные поля: pickup_address, delivery_address, weight_kg, price' 
      })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        shipper_id: req.user.id,
        pickup_address,
        delivery_address,
        weight_kg,
        volume_m3,
        truck_type,
        loading_type,
        price,
        currency: currency || 'BYN',
        loading_date,
        description,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return res.status(500).json({ message: 'Ошибка при создании заказа' })
    }

    res.status(201).json({
      message: 'Заказ создан',
      order
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// PATCH /api/orders/:id - Обновление заказа (только владелец)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Проверяем что заказ принадлежит пользователю
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('shipper_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (existingOrder.shipper_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на редактирование' })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return res.status(500).json({ message: 'Ошибка при обновлении заказа' })
    }

    res.json({
      message: 'Заказ обновлен',
      order
    })
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// DELETE /api/orders/:id - Удаление заказа (только владелец)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Проверяем что заказ принадлежит пользователю
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('shipper_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (existingOrder.shipper_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на удаление' })
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting order:', error)
      return res.status(500).json({ message: 'Ошибка при удалении заказа' })
    }

    res.json({ message: 'Заказ удален' })
  } catch (error) {
    console.error('Delete order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
