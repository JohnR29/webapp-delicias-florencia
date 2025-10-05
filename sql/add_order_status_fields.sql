-- Migración para añadir campos de gestión de estado a la tabla orders
-- Ejecutar en Supabase SQL Editor

-- Añadir nuevas columnas a la tabla orders existente
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispatch_date DATE,
ADD COLUMN IF NOT EXISTS dispatch_notes TEXT,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Comentarios para documentar los campos
COMMENT ON COLUMN orders.status IS 'Estado del pedido: pending, confirmed, dispatched, delivered, cancelled';
COMMENT ON COLUMN orders.customer_email IS 'Email del cliente para notificaciones';
COMMENT ON COLUMN orders.confirmed_at IS 'Fecha y hora cuando se confirmó el pedido';
COMMENT ON COLUMN orders.dispatch_date IS 'Fecha programada de despacho';
COMMENT ON COLUMN orders.dispatch_notes IS 'Notas adicionales para la entrega';
COMMENT ON COLUMN orders.delivered_at IS 'Fecha y hora de entrega confirmada';

-- Actualizar pedidos existentes para que tengan estado pending si no tienen estado
UPDATE orders SET status = 'pending' WHERE status IS NULL;


sadas