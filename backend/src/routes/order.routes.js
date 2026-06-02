import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { authenticateToken } from '../middleware/auth.middleware.js'

const router = Router()

// GET /api/orders - Получение списка заказов с фильтрацией
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'active',  
      sort = 'latest',    
      from,               
      to,                
      search,            
      weight_min,      
      weight_max,        
      price_min,       
      price_max,          
      truck_type,      
      loading_type,       
      loading_date_from,  
      loading_date_to,    
      currency           
    } = req.query

    console.log('Получены фильтры:', { from, to, weight_min, weight_max, price_min, price_max, truck_type })

    let query = supabase
      .from('orders')
      .select('*, users!orders_shipper_id_fkey(name, email, phone)', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (from && from.trim()) {
      query = query.ilike('pickup_address', `%${from.trim()}%`)
    }
    if (to && to.trim()) {
      query = query.ilike('delivery_address', `%${to.trim()}%`)
    }

    if (search && search.trim()) {
      query = query.or(`description.ilike.%${search.trim()}%,pickup_address.ilike.%${search.trim()}%,delivery_address.ilike.%${search.trim()}%`)
    }

    if (weight_min && !isNaN(parseFloat(weight_min))) {
      query = query.gte('weight_kg', parseFloat(weight_min))
    }
    if (weight_max && !isNaN(parseFloat(weight_max))) {
      query = query.lte('weight_kg', parseFloat(weight_max))
    }

    if (price_min && !isNaN(parseFloat(price_min))) {
      query = query.gte('price', parseFloat(price_min))
    }
    if (price_max && !isNaN(parseFloat(price_max))) {
      query = query.lte('price', parseFloat(price_max))
    }

    if (truck_type && truck_type.trim()) {
      query = query.eq('truck_type', truck_type)
    }

    if (loading_type && loading_type.trim()) {
      query = query.eq('loading_type', loading_type)
    }

    if (currency && currency.trim()) {
      query = query.eq('currency', currency)
    }

    if (loading_date_from) {
      query = query.gte('loading_date', loading_date_from)
    }
    if (loading_date_to) {
      query = query.lte('loading_date', loading_date_to)
    }

    switch (sort) {
      case 'latest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'weight_desc':
        query = query.order('weight_kg', { ascending: false })
        break
      case 'weight_asc':
        query = query.order('weight_kg', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { count, error: countError } = await query
    
    if (countError) {
      console.error('Count error:', countError)
    }

    const fromIndex = (parseInt(page) - 1) * parseInt(limit)
    const toIndex = fromIndex + parseInt(limit) - 1
    query = query.range(fromIndex, toIndex)

    const { data: orders, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ message: 'Ошибка при получении заказов' })
    }

    console.log(`Найдено заказов: ${count || 0}, показано: ${orders?.length || 0}`)

    res.json({
      orders: orders || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil((count || 0) / parseInt(limit))
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/orders/my-active - Получить активные заказы
router.get('/my-active', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('orders')
      .select('*, users!orders_shipper_id_fkey(name, email, phone)')
      .eq('status', 'in_progress')

    if (req.user.role === 'carrier') {
      query = query.eq('carrier_id', req.user.id)
    } else if (req.user.role === 'shipper') {
      query = query.eq('shipper_id', req.user.id)
    } else {
      return res.status(403).json({ message: 'Доступ запрещён' })
    }

    const { data: orders, error } = await query.order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching my active orders:', error)
      return res.status(500).json({ message: 'Ошибка при получении заказов' })
    }

    res.json(orders || [])
  } catch (error) {
    console.error('Get my active orders error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/orders/my - Получить заказы текущего пользователя
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shipper_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(orders || [])
  } catch (error) {
    console.error('Error fetching my orders:', error)
    res.status(500).json({ message: 'Ошибка при получении заказов' })
  }
})

// GET /api/orders/:id - Детальная информация о заказе
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

// POST /api/orders - Создание нового заказа
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

    if (!pickup_address || !delivery_address || !weight_kg || !price) {
      return res.status(400).json({ 
        message: 'Заполните обязательные поля: pickup_address, delivery_address, weight_kg, price' 
      })
    }

    // Проверка даты загрузки (не должна быть в прошлом)
    if (loading_date) {
      const selectedDate = new Date(loading_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        return res.status(400).json({ 
          message: 'Дата погрузки не может быть в прошлом. Выберите сегодняшнюю или будущую дату.' 
        })
      }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({ 
        shipper_id: req.user.id,
        pickup_address,
        delivery_address,
        weight_kg,
        volume_m3: volume_m3 || null,
        truck_type: truck_type || null,
        loading_type: loading_type || null,
        price,
        currency: currency || 'BYN',
        loading_date: loading_date || null,
        description: description || null,
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

// PATCH /api/orders/:id - Редактирование заказа
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    
    // Проверка даты загрузки при редактировании
    if (updateData.loading_date) {
      const selectedDate = new Date(updateData.loading_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        return res.status(400).json({ 
          message: 'Дата погрузки не может быть в прошлом. Выберите сегодняшнюю или будущую дату.' 
        })
      }
    }
    
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('shipper_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (existingOrder.shipper_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на редактирование' })
    }

    if (existingOrder.status !== 'active') {
      return res.status(400).json({ message: 'Неактивный заказ нельзя редактировать' })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// DELETE /api/orders/:id - Отмена заказа
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('shipper_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (existingOrder.shipper_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на отмену' })
    }

    if (existingOrder.status !== 'active') {
      return res.status(400).json({ message: 'Неактивный заказ нельзя отменить' })
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'canceled' })
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Заказ отменён' })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/orders/:orderId/accept - Принятие заказа перевозчиком
router.post('/:orderId/accept', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params

    if (req.user.role !== 'carrier') {
      return res.status(403).json({ message: 'Только перевозчик может принять заказ' })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    if (order.status !== 'active') {
      return res.status(400).json({ message: 'Этот заказ уже недоступен' })
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'in_progress',
        carrier_id: req.user.id,
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error accepting order:', updateError)
      return res.status(500).json({ message: 'Ошибка при принятии заказа' })
    }

    res.json({ 
      message: 'Заказ успешно принят', 
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Accept order error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/orders/:orderId/cancel-assignment - Отмена назначения
router.post('/:orderId/cancel-assignment', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return res.status(404).json({ message: 'Заказ не найден' })
    }

    const isShipper = req.user.role === 'shipper' && order.shipper_id === req.user.id
    const isAssignedCarrier = req.user.role === 'carrier' && order.carrier_id === req.user.id

    if (!isShipper && !isAssignedCarrier) {
      return res.status(403).json({ message: 'Нет прав на отмену' })
    }

    if (order.status !== 'in_progress') {
      return res.status(400).json({ message: 'Этот заказ нельзя отменить' })
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'active',
        carrier_id: null,
        assigned_at: null
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error canceling assignment:', updateError)
      return res.status(500).json({ message: 'Ошибка при отмене' })
    }

    res.json({ 
      message: 'Назначение отменено', 
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Cancel assignment error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router