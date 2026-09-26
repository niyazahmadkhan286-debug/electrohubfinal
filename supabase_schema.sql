-- ==============================================================
-- ELECTROHUB - SMART ELECTRONICS INVENTORY & MANAGEMENT SYSTEM
-- Production PostgreSQL / Supabase Complete Database Reset & Schema
-- ==============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Clean Drop of All Conflicting Database Objects (Cascade ensures zero dependency issues)
DROP TRIGGER IF EXISTS trg_update_product_status ON public.products CASCADE;
DROP TRIGGER IF EXISTS trg_update_product_updated_at ON public.products CASCADE;
DROP FUNCTION IF EXISTS public.update_product_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.deduct_product_stock(VARCHAR, INTEGER) CASCADE;

DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.discontinued_products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.full_time_employees CASCADE;
DROP TABLE IF EXISTS public.part_time_employees CASCADE;
DROP TABLE IF EXISTS public.contractors CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 3. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    brand VARCHAR(100) NOT NULL DEFAULT 'Generic',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (min_stock_threshold >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'IN STOCK',
    description TEXT,
    sku VARCHAR(100),
    image TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Discontinued Products Table
CREATE TABLE public.discontinued_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    previous_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (previous_price >= 0),
    reason TEXT NOT NULL,
    discontinued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT
);

-- 5. Customers Table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    company VARCHAR(150),
    total_spent NUMERIC(12, 2) DEFAULT 0 CHECK (total_spent >= 0),
    orders_count INTEGER DEFAULT 0 CHECK (orders_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
    order_total NUMERIC(12, 2) NOT NULL CHECK (order_total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Order Items Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 8. Base Employees Table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id VARCHAR(50) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Full-Time Employees Detail Table
CREATE TABLE public.full_time_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL REFERENCES public.employees(emp_id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    annual_salary NUMERIC(12, 2) NOT NULL CHECK (annual_salary >= 0),
    health_benefits BOOLEAN DEFAULT true,
    paid_leave_days INTEGER DEFAULT 25
);

-- 10. Part-Time Employees Detail Table
CREATE TABLE public.part_time_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL REFERENCES public.employees(emp_id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    weekly_hours INTEGER NOT NULL CHECK (weekly_hours > 0),
    schedule_type VARCHAR(100) DEFAULT 'Morning Shift'
);

-- 11. Contractors Detail Table
CREATE TABLE public.contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    agency_or_company VARCHAR(150) NOT NULL,
    contract_rate NUMERIC(10, 2) NOT NULL CHECK (contract_rate >= 0),
    rate_type VARCHAR(20) DEFAULT 'hourly',
    project_assigned VARCHAR(200) NOT NULL,
    contract_end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active'
);

-- 12. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_type ON public.employees(employment_type);

-- 13. Dynamic Triggers & Automated Calculations
CREATE OR REPLACE FUNCTION public.update_product_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize product_name and name
    IF NEW.product_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
        NEW.name := NEW.product_name;
    ELSIF NEW.name IS NOT NULL AND (NEW.product_name IS NULL OR NEW.product_name = '') THEN
        NEW.product_name := NEW.name;
    END IF;

    -- Automatically compute status from stock_quantity and min_stock_threshold
    IF NEW.stock_quantity = 0 THEN
        NEW.status := 'OUT OF STOCK';
    ELSIF NEW.stock_quantity <= NEW.min_stock_threshold THEN
        NEW.status := 'LOW STOCK';
    ELSE
        NEW.status := 'IN STOCK';
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_product_status
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_product_status();

-- 14. Stock Deduction Stored Procedure
CREATE OR REPLACE FUNCTION public.deduct_product_stock(p_product_id VARCHAR, p_quantity INTEGER)
RETURNS VOID AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO current_stock FROM public.products WHERE product_id = p_product_id FOR UPDATE;
    
    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product % not found', p_product_id;
    END IF;
    
    IF current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', p_product_id, current_stock, p_quantity;
    END IF;
    
    UPDATE public.products
    SET stock_quantity = stock_quantity - p_quantity
    WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 15. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discontinued_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.full_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

-- 16. Row Level Security Policies
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read discontinued" ON public.discontinued_products FOR SELECT USING (true);
CREATE POLICY "Allow public insert discontinued" ON public.discontinued_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update discontinued" ON public.discontinued_products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete discontinued" ON public.discontinued_products FOR DELETE USING (true);

CREATE POLICY "Allow public read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete customers" ON public.customers FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_items" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete order_items" ON public.order_items FOR DELETE USING (true);

CREATE POLICY "Allow public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update employees" ON public.employees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete employees" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Allow public read full_time" ON public.full_time_employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert full_time" ON public.full_time_employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update full_time" ON public.full_time_employees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete full_time" ON public.full_time_employees FOR DELETE USING (true);

CREATE POLICY "Allow public read part_time" ON public.part_time_employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert part_time" ON public.part_time_employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update part_time" ON public.part_time_employees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete part_time" ON public.part_time_employees FOR DELETE USING (true);

CREATE POLICY "Allow public read contractors" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "Allow public insert contractors" ON public.contractors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contractors" ON public.contractors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete contractors" ON public.contractors FOR DELETE USING (true);

-- 17. Seed Data: Sample Electronics Inventory
INSERT INTO public.products (product_id, product_name, name, category, brand, price, stock_quantity, min_stock_threshold, description, sku, image)
VALUES
('PRD-101', 'STM32F407 Cortex-M4 Microcontroller Dev Board', 'STM32F407 Cortex-M4 Microcontroller Dev Board', 'Microcontrollers & ICs', 'STMicroelectronics', 24.99, 140, 20, 'High-performance ARM Cortex-M4 MCU with 1MB Flash, 168MHz clock', 'MCU-STM32-407', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'),
('PRD-102', 'Raspberry Pi 5 Model B (8GB RAM)', 'Raspberry Pi 5 Model B (8GB RAM)', 'Computer Hardware & GPUs', 'Raspberry Pi Foundation', 85.00, 64, 15, 'Quad-core 64-bit Arm Cortex-A76 processor at 2.4GHz with PCIe support', 'SBC-RPI5-8GB', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500'),
('PRD-103', 'ESP32-S3 Dual-Core WiFi & BLE 5.0 Module', 'ESP32-S3 Dual-Core WiFi & BLE 5.0 Module', 'Wireless & IoT', 'Espressif Systems', 7.50, 310, 50, '2.4 GHz Wi-Fi and Bluetooth 5 (LE) SoC with AI vector instructions', 'IOT-ESP32-S3', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500'),
('PRD-104', 'Bosch BME688 4-in-1 Environmental Gas Sensor', 'Bosch BME688 4-in-1 Environmental Gas Sensor', 'Sensors & Modules', 'Bosch Sensortec', 18.25, 12, 15, 'Gas, humidity, pressure and temperature sensor with AI capabilities', 'SEN-BME-688', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'),
('PRD-105', '0.96-inch I2C Monochrome OLED Display 128x64', '0.96-inch I2C Monochrome OLED Display 128x64', 'Displays & Optoelectronics', 'Adafruit Industries', 4.80, 220, 30, 'Bright blue/white SSD1306 driver OLED screen with I2C interface', 'DSP-OLED-096', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500'),
('PRD-106', 'NVIDIA Jetson Orin Nano Developer Kit 8GB', 'NVIDIA Jetson Orin Nano Developer Kit 8GB', 'Computer Hardware & GPUs', 'NVIDIA', 499.00, 5, 8, 'Up to 40 TOPS AI compute for next-gen edge AI and robotics', 'EMB-JETSON-ORIN', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'),
('PRD-107', '18650 3.7V 3500mAh High-Drain Li-ion Cell', '18650 3.7V 3500mAh High-Drain Li-ion Cell', 'Power & Batteries', 'Samsung SDI', 6.95, 0, 25, 'Grade-A lithium battery cell with 10A continuous discharge', 'PWR-BAT-18650', 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=500'),
('PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 'Test & Measurement', 'Siglent Technologies', 379.00, 8, 4, 'Super Phosphor Oscilloscope with SPO technology and 1 GSa/s', 'TST-SIG-1104', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500'),
('PRD-109', 'NEMA 17 Stepper Motor 1.8 Deg 42Ncm 1.5A', 'NEMA 17 Stepper Motor 1.8 Deg 42Ncm 1.5A', 'Robotics & Motors', 'StepperOnline', 14.50, 48, 15, 'High torque bipolar hybrid stepper motor for 3D printers and CNC', 'ROB-NEMA-17', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500'),
('PRD-110', 'TS101 Smart Digital USB-C Soldering Iron', 'TS101 Smart Digital USB-C Soldering Iron', 'Tools & Soldering', 'Miniware', 59.99, 0, 10, 'OLED temperature controlled soldering tool with PD 65W input', 'TLS-TS101-PD', 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500')
ON CONFLICT (product_id) DO NOTHING;

-- 18. Seed Data: Discontinued Products Registry
INSERT INTO public.discontinued_products (product_id, product_name, category, previous_price, reason, discontinued_at, notes)
VALUES
('DISC-001', 'Atmel ATmega328P DIP-28 Microcontroller', 'Microcontrollers & ICs', 3.50, 'Superseded by ATmega328PB and modern ARM alternatives with lower cost and higher flash', '2025-11-15', 'End of commercial production batch'),
('DISC-002', 'CC2541 Bluetooth 4.0 Low Energy Module', 'Wireless & IoT', 4.20, 'Observed severe latency, Bluetooth 5.0 chips now standard across all product lines', '2025-12-01', 'Legacy RF design replaced with ESP32-C3'),
('DISC-003', 'Lead-based 60/40 Rosin Core Solder Wire 500g', 'Tools & Soldering', 21.00, 'RoHS environmental compliance directive compliance update', '2026-01-10', 'Replaced with SAC305 Lead-Free solder alloy')
ON CONFLICT (product_id) DO NOTHING;

-- 19. Seed Data: Enterprise Customers
INSERT INTO public.customers (customer_id, first_name, last_name, email, phone, address, company, total_spent, orders_count)
VALUES
('CUST-101', 'Elena', 'Vance', 'elena.vance@blackmesa.tech', '+1 (555) 234-8901', '104 Innovation Way, Austin, TX', 'Vance Robotics Lab', 2450.00, 4),
('CUST-102', 'Marcus', 'Chen', 'marcus.chen@quantumchip.io', '+1 (555) 345-6789', '88 Silicon Parkway, San Jose, CA', 'Quantum Chipworks', 4890.50, 7),
('CUST-103', 'Amina', 'Diallo', 'amina@aerotech-sensors.org', '+1 (555) 456-7890', '412 Aerospace Blvd, Seattle, WA', 'AeroTech Dynamics', 1230.25, 2),
('CUST-104', 'David', 'Kowalski', 'd.kowalski@iotdevices.de', '+1 (555) 567-8901', '72 Circuit Avenue, Boston, MA', 'Kowalski Smart Systems', 890.00, 3)
ON CONFLICT (customer_id) DO NOTHING;

-- 20. Seed Data: Orders
INSERT INTO public.orders (order_id, customer_id, order_total, status, payment_method, shipping_address)
VALUES
('ORD-501', 'CUST-101', 1047.98, 'Completed', 'Bank Wire', '104 Innovation Way, Austin, TX'),
('ORD-502', 'CUST-102', 1582.00, 'Processing', 'Corporate Card', '88 Silicon Parkway, San Jose, CA'),
('ORD-503', 'CUST-103', 379.00, 'Completed', 'Credit Card', '412 Aerospace Blvd, Seattle, WA'),
('ORD-504', 'CUST-104', 145.00, 'Pending', 'Credit Card', '72 Circuit Avenue, Boston, MA')
ON CONFLICT (order_id) DO NOTHING;

-- 21. Seed Data: Order Items
INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
('ORD-501', 'PRD-106', 'NVIDIA Jetson Orin Nano Developer Kit 8GB', 2, 499.00, 998.00),
('ORD-501', 'PRD-101', 'STM32F407 Cortex-M4 Microcontroller Dev Board', 2, 24.99, 49.98),
('ORD-502', 'PRD-102', 'Raspberry Pi 5 Model B (8GB RAM)', 10, 85.00, 850.00),
('ORD-502', 'PRD-103', 'ESP32-S3 Dual-Core WiFi & BLE 5.0 Module', 50, 7.50, 375.00),
('ORD-502', 'PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 1, 379.00, 379.00),
('ORD-503', 'PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 1, 379.00, 379.00),
('ORD-504', 'PRD-109', 'NEMA 17 Stepper Motor 1.8 Deg 42Ncm 1.5A', 10, 14.50, 145.00)
ON CONFLICT DO NOTHING;

-- 22. Seed Data: Personnel Directory
INSERT INTO public.employees (emp_id, first_name, last_name, email, phone, department_id, department_name, employment_type, role, hire_date, status)
VALUES
('EMP-201', 'Sarah', 'Connor', 'sarah.c@electrohub.internal', '+1 (555) 101-2001', 'DEPT-ENG', 'Hardware Engineering', 'FULL_TIME', 'Lead Systems Architect', '2023-03-15', 'Active'),
('EMP-202', 'Vikram', 'Patel', 'vikram.p@electrohub.internal', '+1 (555) 101-2002', 'DEPT-OPS', 'Supply Chain & Inventory', 'FULL_TIME', 'Senior Inventory Director', '2023-06-01', 'Active'),
('EMP-203', 'Jessica', 'Taylor', 'jessica.t@electrohub.internal', '+1 (555) 101-2003', 'DEPT-OPS', 'Supply Chain & Inventory', 'PART_TIME', 'Quality Assurance Specialist', '2024-01-10', 'Active'),
('EMP-204', 'Devon', 'Miles', 'devon.m@electrohub.internal', '+1 (555) 101-2004', 'DEPT-SALES', 'Client Solutions', 'PART_TIME', 'Technical Sales Associate', '2024-04-18', 'Active')
ON CONFLICT (emp_id) DO NOTHING;

-- 23. Seed Data: Full-Time Compensation & Benefits
INSERT INTO public.full_time_employees (emp_id, department_name, annual_salary, health_benefits, paid_leave_days)
VALUES
('EMP-201', 'Hardware Engineering', 135000.00, true, 28),
('EMP-202', 'Supply Chain & Inventory', 112000.00, true, 25)
ON CONFLICT (emp_id) DO NOTHING;

-- 24. Seed Data: Part-Time Schedules & Rates
INSERT INTO public.part_time_employees (emp_id, department_name, hourly_rate, weekly_hours, schedule_type)
VALUES
('EMP-203', 'Supply Chain & Inventory', 32.50, 24, 'Morning / Lab Testing Shift'),
('EMP-204', 'Client Solutions', 28.00, 20, 'Afternoon / Client Demo Shift')
ON CONFLICT (emp_id) DO NOTHING;

-- 25. Seed Data: Specialist Contractors
INSERT INTO public.contractors (contractor_id, first_name, last_name, email, phone, agency_or_company, contract_rate, rate_type, project_assigned, contract_end_date, status)
VALUES
('CNT-301', 'Lukas', 'Novak', 'lukas.novak@apexembedded.com', '+1 (555) 789-1001', 'Apex Embedded Consulting', 95.00, 'hourly', 'PCIe Gen4 High-Speed Circuit Verification', '2026-12-31', 'Active'),
('CNT-302', 'Priya', 'Sundaram', 'priya.s@opticsflow.org', '+1 (555) 789-1002', 'OpticsFlow Engineering', 85.00, 'hourly', 'Firmware Driver Optimization for OLED Modules', '2026-11-30', 'Active')
ON CONFLICT (contractor_id) DO NOTHING;
