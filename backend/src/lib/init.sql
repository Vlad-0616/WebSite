-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'shipper' CHECK (role IN ('shipper', 'carrier', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pickup_address VARCHAR(500) NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  volume_m3 DECIMAL(10, 2),
  truck_type VARCHAR(50),
  loading_type VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BYN',
  loading_date DATE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы trucks (транспортные средства)
CREATE TABLE IF NOT EXISTS trucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  truck_type VARCHAR(50) NOT NULL CHECK (truck_type IN ('refrigerator', 'tent', 'flatbed', 'container', 'curtain', 'isothermal')),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  plate_number VARCHAR(20) NOT NULL,
  capacity_kg DECIMAL(10, 2) NOT NULL,
  capacity_m3 DECIMAL(10, 2),
  dimensions VARCHAR(100),
  available BOOLEAN DEFAULT true,
  location VARCHAR(255),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shipper_id ON orders(shipper_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Индексы для таблицы trucks
CREATE INDEX IF NOT EXISTS idx_trucks_carrier_id ON trucks(carrier_id);
CREATE INDEX IF NOT EXISTS idx_trucks_truck_type ON trucks(truck_type);
CREATE INDEX IF NOT EXISTS idx_trucks_available ON trucks(available);
CREATE INDEX IF NOT EXISTS idx_trucks_location ON trucks(location);

-- Триггер для updated_at
CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies для trucks
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Перевозчики могут управлять своим транспортом
CREATE POLICY "Carriers can manage own trucks"
  ON trucks FOR ALL
  TO authenticated
  USING (auth.uid() = carrier_id)
  WITH CHECK (auth.uid() = carrier_id);

-- Все могут просматривать доступный транспорт
CREATE POLICY "Anyone can view available trucks"
  ON trucks FOR SELECT
  TO authenticated
  USING (available = true OR auth.uid() = carrier_id);

-- Добавляем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть свои данные
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Пользователи могут редактировать свои данные
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Все могут видеть заказы (публичный доступ)
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Только владелец может создавать заказы
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shipper_id);

-- Только владелец может редактировать заказы
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = shipper_id);

-- Только владелец может удалять заказы
CREATE POLICY "Users can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (auth.uid() = shipper_id);

-- Создание таблицы bids (ставки)
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BYN',
  message TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier_id ON bids(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Триггер для updated_at
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Перевозчики могут управлять своими ставками
CREATE POLICY "Carriers can manage own bids"
  ON bids FOR ALL
  TO authenticated
  USING (auth.uid() = carrier_id)
  WITH CHECK (auth.uid() = carrier_id);

-- Грузовладельцы могут видеть ставки на свои заказы
CREATE POLICY "Shippers can view bids on their orders"
  ON bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = bids.order_id 
      AND orders.shipper_id = auth.uid()
    )
  );

-- Все авторизованные могут видеть активные ставки
CREATE POLICY "Anyone can view active bids"
  ON bids FOR SELECT
  TO authenticated
  USING (status = 'active');
