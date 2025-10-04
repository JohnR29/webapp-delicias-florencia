-- Script para actualizar pedidos existentes con customer_email
-- Ejecutar en Supabase SQL Editor

-- Actualizar pedidos que no tienen customer_email pero sí tienen el correo en order_data
UPDATE orders 
SET customer_email = (order_data->>'businessInfo'->>'correo')::text
WHERE customer_email IS NULL 
  AND order_data->>'businessInfo'->>'correo' IS NOT NULL;

-- Verificar el resultado
SELECT 
  id,
  customer_email,
  order_data->'businessInfo'->>'correo' as correo_en_data,
  status,
  created_at
FROM orders 
WHERE customer_email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;