import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { authenticateToken } from '../middleware/auth.middleware.js'

const router = Router()

// GET /api/trucks - Список доступного транспорта с фильтрацией
router.get('/', async (req, res) => {
  try {
    console.log('=== GET /api/trucks ===')
    console.log('Query params:', req.query)
    // Параметры фильтрации
    const { 
      truck_type,    
      location,      
      capacity_min,  
      capacity_max,  
      volume_min,    
      volume_max     
    } = req.query
    
    // Базовый запрос - только доступный транспорт
    let query = supabase
      .from('trucks')
      .select('*')
      .eq('available', true)
    
    // Фильтр по типу транспорта (точное совпадение)
    if (truck_type && truck_type.trim() !== '') {
      console.log(`Фильтр по типу: ${truck_type}`)
      query = query.eq('truck_type', truck_type)
    }
    
    // Фильтр по местоположению (частичное совпадение, регистронезависимо)
    if (location && location.trim() !== '') {
      console.log(`Фильтр по местоположению: ${location}`)
      query = query.ilike('location', `%${location.trim()}%`)
    }
    
    // Фильтр по минимальной грузоподъемности
    if (capacity_min && !isNaN(parseFloat(capacity_min))) {
      console.log(`Фильтр capacity_min: ${capacity_min}`)
      query = query.gte('capacity_kg', parseFloat(capacity_min))
    }
    
    // Фильтр по максимальной грузоподъемности
    if (capacity_max && !isNaN(parseFloat(capacity_max))) {
      console.log(`Фильтр capacity_max: ${capacity_max}`)
      query = query.lte('capacity_kg', parseFloat(capacity_max))
    }
    
    // Фильтр по минимальному объему
    if (volume_min && !isNaN(parseFloat(volume_min))) {
      console.log(`Фильтр volume_min: ${volume_min}`)
      query = query.gte('capacity_m3', parseFloat(volume_min))
    }
    
    // Фильтр по максимальному объему
    if (volume_max && !isNaN(parseFloat(volume_max))) {
      console.log(`Фильтр volume_max: ${volume_max}`)
      query = query.lte('capacity_m3', parseFloat(volume_max))
    }
    
    // Ограничиваем количество результатов для производительности
    query = query.limit(50)
    
    const { data: trucks, error } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ 
        message: 'Ошибка базы данных', 
        error: error.message 
      })
    }
    
    console.log(`Найдено: ${trucks?.length || 0} единиц`)
    res.json(trucks || [])
  } catch (err) {
    console.error('Caught exception:', err)
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера',
      error: err.message 
    })
  }
})

// GET /api/truck-types - Справочник типов транспорта (для выпадающих списков)
router.get('/types', async (req, res) => {
  try {
    const truckTypes = [
      { id: 'refrigerator', name: 'Рефрижератор', icon: '❄️' },
      { id: 'tent', name: 'Тент', icon: '🚛' },
      { id: 'flatbed', name: 'Платформа', icon: '📦' },
      { id: 'container', name: 'Контейнеровоз', icon: '📦' },
      { id: 'curtain', name: 'Штора', icon: '🚚' },
      { id: 'isothermal', name: 'Изотермический', icon: '🌡️' }
    ]
    
    res.json(truckTypes)
  } catch (error) {
    console.error('Get truck types error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/trucks/:id - Детальная информация о конкретном транспорте
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: truck, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !truck) {
      return res.status(404).json({ message: 'Транспорт не найден' })
    }

    res.json(truck)
  } catch (error) {
    console.error('Get truck error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/trucks/my - Получить транспорт текущего перевозчика
router.get('/my', authenticateToken, async (req, res) => {
  try {
    // Только перевозчики имеют доступ
    if (req.user.role !== 'carrier') {
      return res.status(403).json({ message: 'Доступ только для перевозчиков' })
    }

    const { data: trucks, error } = await supabase
      .from('trucks')
      .select('*')
      .eq('carrier_id', req.user.id)  // Только транспорт текущего пользователя
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my trucks:', error)
      return res.status(500).json({ message: 'Ошибка при получении транспорта' })
    }

    res.json(trucks || [])
  } catch (error) {
    console.error('Get my trucks error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/trucks - Добавить новое транспортное средство
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Только перевозчики могут добавлять транспорт
    if (req.user.role !== 'carrier') {
      return res.status(403).json({ 
        message: 'Только перевозчики могут добавлять транспорт' 
      })
    }
    // Извлекаем все поля транспортного средства
    const {
      truck_type_id,   
      capacity_kg,     
      capacity_m3,   
      plate_number,   
      available,      
      location,     
      brand,          
      model,          
      year,          
      dimensions,     
      description    
    } = req.body

    // Валидация обязательных полей
    if (!truck_type_id || !plate_number || !capacity_kg) {
      return res.status(400).json({ 
        message: 'Заполните обязательные поля: truck_type_id, plate_number, capacity_kg' 
      })
    }

    // Вставка нового транспорта в БД
    const { data: truck, error } = await supabase
      .from('trucks')
      .insert({          
        carrier_id: req.user.id, // ID перевозчика из токена
        truck_type: truck_type_id,           
        capacity_kg: parseFloat(capacity_kg), 
        capacity_m3: capacity_m3 ? parseFloat(capacity_m3) : null,  
        plate_number: plate_number.toUpperCase(),  
        available: available !== undefined ? available : true, // Доступен по умолчанию
        location: location || null,
        brand: brand || null,
        model: model || null,
        dimensions: dimensions || null,
        description: description || null,
        year: year ? parseInt(year) : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating truck:', error)
      return res.status(500).json({ 
        message: 'Ошибка при добавлении транспорта' 
      })
    }

    res.status(201).json({
      message: 'Транспорт добавлен',
      truck
    })
  } catch (error) {
    console.error('Create truck error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// PATCH /api/trucks/:id - Редактировать транспортное средство
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Проверяем, что транспорт существует и принадлежит текущему пользователю
    const { data: existingTruck, error: fetchError } = await supabase
      .from('trucks')
      .select('carrier_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingTruck) {
      return res.status(404).json({ message: 'Транспорт не найден' })
    }

    // Проверка прав только владелец может редактировать
    if (existingTruck.carrier_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на редактирование' })
    }
    // Подготавливаем данные для обновления
    const updateData = { ...req.body }
    
    // Преобразуем truck_type_id в truck_type для совместимости с БД
    if (updateData.truck_type_id) {
      updateData.truck_type = updateData.truck_type_id
      delete updateData.truck_type_id
    }
    
    // Приводим числа к правильному типу
    if (updateData.capacity_kg) updateData.capacity_kg = parseFloat(updateData.capacity_kg)
    if (updateData.capacity_m3) updateData.capacity_m3 = parseFloat(updateData.capacity_m3)
    if (updateData.year) updateData.year = parseInt(updateData.year)
    if (updateData.plate_number) updateData.plate_number = updateData.plate_number.toUpperCase()

    // Обновляем запись
    const { data: truck, error } = await supabase
      .from('trucks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating truck:', error)
      return res.status(500).json({ message: 'Ошибка при обновлении транспорта' })
    }

    res.json({
      message: 'Транспорт обновлен',
      truck
    })
  } catch (error) {
    console.error('Update truck error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// PATCH /api/trucks/:id/availability - Изменить статус доступности
router.patch('/:id/availability', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { available } = req.body  // true - доступен, false - недоступен

    // Проверяем права владельца
    const { data: existingTruck, error: fetchError } = await supabase
      .from('trucks')
      .select('carrier_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingTruck) {
      return res.status(404).json({ message: 'Транспорт не найден' })
    }

    if (existingTruck.carrier_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на изменение' })
    }

    // Обновляем только поле available
    const { data: truck, error } = await supabase
      .from('trucks')
      .update({ available })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating truck availability:', error)
      return res.status(500).json({ message: 'Ошибка при изменении статуса' })
    }

    res.json({
      message: `Транспорт ${available ? 'доступен' : 'недоступен'}`,
      truck
    })
  } catch (error) {
    console.error('Update availability error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// DELETE /api/trucks/:id - Удалить транспортное средство
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Проверяем права владельца
    const { data: existingTruck, error: fetchError } = await supabase
      .from('trucks')
      .select('carrier_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingTruck) {
      return res.status(404).json({ message: 'Транспорт не найден' })
    }

    if (existingTruck.carrier_id !== req.user.id) {
      return res.status(403).json({ message: 'Нет прав на удаление' })
    }

    // Удаляем запись
    const { error } = await supabase
      .from('trucks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting truck:', error)
      return res.status(500).json({ message: 'Ошибка при удалении транспорта' })
    }

    res.json({ message: 'Транспорт удален' })
  } catch (error) {
    console.error('Delete truck error:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router