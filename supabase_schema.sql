-- ==============================================================
-- ELECTROHUB - SMART ELECTRONICS INVENTORY & MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Database Schema
-- ==============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (min_stock_threshold >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'IN STOCK',
    description TEXT,
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. DISCONTINUED PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS discontinued_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    previous_price NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    discontinued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
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

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_total NUMERIC(12, 2) NOT NULL CHECK (order_total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ORDER ITEMS TABLE (Relationship for order items)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 6. EMPLOYEES TABLE (Main employee registry)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id VARCHAR(50) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- 'FULL_TIME', 'PART_TIME', 'CONTRACTOR'
    role VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. FULL TIME EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS full_time_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL REFERENCES employees(emp_id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    annual_salary NUMERIC(12, 2) NOT NULL CHECK (annual_salary >= 0),
    health_benefits BOOLEAN DEFAULT true,
    paid_leave_days INTEGER DEFAULT 25
);

-- 8. PART TIME EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS part_time_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emp_id VARCHAR(50) UNIQUE NOT NULL REFERENCES employees(emp_id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    weekly_hours INTEGER NOT NULL CHECK (weekly_hours > 0),
    schedule_type VARCHAR(100) DEFAULT 'Morning Shift'
);

-- 9. CONTRACTORS TABLE
CREATE TABLE IF NOT EXISTS contractors (
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

-- Create Indexes for fast querying and search
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_type ON employees(employment_type);

-- Row Level Security (RLS) Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discontinued_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE full_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_time_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read/write for system management
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true);

CREATE POLICY "Public read discontinued" ON discontinued_products FOR SELECT USING (true);
CREATE POLICY "Public write discontinued" ON discontinued_products FOR ALL USING (true);

CREATE POLICY "Public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public write customers" ON customers FOR ALL USING (true);

CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public write orders" ON orders FOR ALL USING (true);

CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public write order_items" ON order_items FOR ALL USING (true);

CREATE POLICY "Public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public write employees" ON employees FOR ALL USING (true);

CREATE POLICY "Public read full_time" ON full_time_employees FOR SELECT USING (true);
CREATE POLICY "Public write full_time" ON full_time_employees FOR ALL USING (true);

CREATE POLICY "Public read part_time" ON part_time_employees FOR SELECT USING (true);
CREATE POLICY "Public write part_time" ON part_time_employees FOR ALL USING (true);

CREATE POLICY "Public read contractors" ON contractors FOR SELECT USING (true);
CREATE POLICY "Public write contractors" ON contractors FOR ALL USING (true);

-- Sample Electronics Seed Data
INSERT INTO products (product_id, product_name, category, price, stock_quantity, min_stock_threshold, status, description, sku)
VALUES
('PRD-101', 'STM32F407 Cortex-M4 Microcontroller Dev Board', 'Microcontrollers & ICs', 24.99, 140, 20, 'IN STOCK', 'High-performance ARM Cortex-M4 MCU with 1MB Flash, 168MHz clock', 'MCU-STM32-407'),
('PRD-102', 'Raspberry Pi 5 Model B (8GB RAM)', 'Computer Hardware & GPUs', 85.00, 64, 15, 'IN STOCK', 'Quad-core 64-bit Arm Cortex-A76 processor at 2.4GHz with PCIe support', 'SBC-RPI5-8GB'),
('PRD-103', 'ESP32-S3 Dual-Core WiFi & BLE 5.0 Module', 'Wireless & IoT', 7.50, 310, 50, 'IN STOCK', '2.4 GHz Wi-Fi and Bluetooth 5 (LE) SoC with AI vector instructions', 'IOT-ESP32-S3'),
('PRD-104', 'Bosch BME688 4-in-1 Environmental Gas Sensor', 'Sensors & Modules', 18.25, 12, 15, 'LOW STOCK', 'Gas, humidity, pressure and temperature sensor with AI capabilities', 'SEN-BME-688'),
('PRD-105', '0.96-inch I2C Monochrome OLED Display 128x64', 'Displays & Optoelectronics', 4.80, 220, 30, 'IN STOCK', 'Bright blue/white SSD1306 driver OLED screen with I2C interface', 'DSP-OLED-096'),
('PRD-106', 'NVIDIA Jetson Orin Nano Developer Kit 8GB', 'Computer Hardware & GPUs', 499.00, 5, 8, 'LOW STOCK', 'Up to 40 TOPS AI compute for next-gen edge AI and robotics', 'EMB-JETSON-ORIN'),
('PRD-107', '18650 3.7V 3500mAh High-Drain Li-ion Cell', 'Power & Batteries', 6.95, 0, 25, 'OUT OF STOCK', 'Grade-A lithium battery cell with 10A continuous discharge', 'PWR-BAT-18650'),
('PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 'Test & Measurement', 379.00, 8, 4, 'IN STOCK', 'Super Phosphor Oscilloscope with SPO technology and 1 GSa/s', 'TST-SIG-1104'),
('PRD-109', 'NEMA 17 Stepper Motor 1.8 Deg 42Ncm 1.5A', 'Robotics & Motors', 14.50, 48, 15, 'IN STOCK', 'High torque bipolar hybrid stepper motor for 3D printers and CNC', 'ROB-NEMA-17'),
('PRD-110', 'TS101 Smart Digital USB-C Soldering Iron', 'Tools & Soldering', 59.99, 0, 10, 'OUT OF STOCK', 'OLED temperature controlled soldering tool with PD 65W input', 'TLS-TS101-PD')
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO discontinued_products (product_id, product_name, category, previous_price, reason, discontinued_at, notes)
VALUES
('DISC-001', 'Atmel ATmega328P DIP-28 Microcontroller', 'Microcontrollers & ICs', 3.50, 'Superseded by ATmega328PB and modern ARM alternatives with lower cost and higher flash', '2025-11-15', 'End of commercial production batch'),
('DISC-002', 'CC2541 Bluetooth 4.0 Low Energy Module', 'Wireless & IoT', 4.20, 'Observed severe latency, Bluetooth 5.0 chips now standard across all product lines', '2025-12-01', 'Legacy RF design replaced with ESP32-C3'),
('DISC-003', 'Lead-based 60/40 Rosin Core Solder Wire 500g', 'Tools & Soldering', 21.00, 'RoHS environmental compliance directive compliance update', '2026-01-10', 'Replaced with SAC305 Lead-Free solder alloy')
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO customers (customer_id, first_name, last_name, email, phone, address, company, total_spent, orders_count)
VALUES
('CUST-101', 'Elena', 'Vance', 'elena.vance@blackmesa.tech', '+1 (555) 234-8901', '104 Innovation Way, Austin, TX', 'Vance Robotics Lab', 2450.00, 4),
('CUST-102', 'Marcus', 'Chen', 'marcus.chen@quantumchip.io', '+1 (555) 345-6789', '88 Silicon Parkway, San Jose, CA', 'Quantum Chipworks', 4890.50, 7),
('CUST-103', 'Amina', 'Diallo', 'amina@aerotech-sensors.org', '+1 (555) 456-7890', '412 Aerospace Blvd, Seattle, WA', 'AeroTech Dynamics', 1230.25, 2),
('CUST-104', 'David', 'Kowalski', 'd.kowalski@iotdevices.de', '+1 (555) 567-8901', '72 Circuit Avenue, Boston, MA', 'Kowalski Smart Systems', 890.00, 3)
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO orders (order_id, customer_id, order_total, status, payment_method, shipping_address)
VALUES
('ORD-501', 'CUST-101', 1047.98, 'Completed', 'Bank Wire', '104 Innovation Way, Austin, TX'),
('ORD-502', 'CUST-102', 1582.00, 'Processing', 'Corporate Card', '88 Silicon Parkway, San Jose, CA'),
('ORD-503', 'CUST-103', 379.00, 'Completed', 'Credit Card', '412 Aerospace Blvd, Seattle, WA'),
('ORD-504', 'CUST-104', 145.00, 'Pending', 'Credit Card', '72 Circuit Avenue, Boston, MA')
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
VALUES
('ORD-501', 'PRD-106', 'NVIDIA Jetson Orin Nano Developer Kit 8GB', 2, 499.00, 998.00),
('ORD-501', 'PRD-101', 'STM32F407 Cortex-M4 Microcontroller Dev Board', 2, 24.99, 49.98),
('ORD-502', 'PRD-102', 'Raspberry Pi 5 Model B (8GB RAM)', 10, 85.00, 850.00),
('ORD-502', 'PRD-103', 'ESP32-S3 Dual-Core WiFi & BLE 5.0 Module', 50, 7.50, 375.00),
('ORD-502', 'PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 1, 379.00, 379.00),
('ORD-503', 'PRD-108', 'Siglent SDS1104X-E 100MHz 4-Channel Oscilloscope', 1, 379.00, 379.00),
('ORD-504', 'PRD-109', 'NEMA 17 Stepper Motor 1.8 Deg 42Ncm 1.5A', 10, 14.50, 145.00)
ON CONFLICT DO NOTHING;

INSERT INTO employees (emp_id, first_name, last_name, email, phone, department_id, department_name, employment_type, role, hire_date, status)
VALUES
('EMP-201', 'Sarah', 'Connor', 'sarah.c@electrohub.internal', '+1 (555) 101-2001', 'DEPT-ENG', 'Hardware Engineering', 'FULL_TIME', 'Lead Systems Architect', '2023-03-15', 'Active'),
('EMP-202', 'Vikram', 'Patel', 'vikram.p@electrohub.internal', '+1 (555) 101-2002', 'DEPT-OPS', 'Supply Chain & Inventory', 'FULL_TIME', 'Senior Inventory Director', '2023-06-01', 'Active'),
('EMP-203', 'Jessica', 'Taylor', 'jessica.t@electrohub.internal', '+1 (555) 101-2003', 'DEPT-OPS', 'Supply Chain & Inventory', 'PART_TIME', 'Quality Assurance Specialist', '2024-01-10', 'Active'),
('EMP-204', 'Devon', 'Miles', 'devon.m@electrohub.internal', '+1 (555) 101-2004', 'DEPT-SALES', 'Client Solutions', 'PART_TIME', 'Technical Sales Associate', '2024-04-18', 'Active')
ON CONFLICT (emp_id) DO NOTHING;

INSERT INTO full_time_employees (emp_id, department_name, annual_salary, health_benefits, paid_leave_days)
VALUES
('EMP-201', 'Hardware Engineering', 135000.00, true, 28),
('EMP-202', 'Supply Chain & Inventory', 112000.00, true, 25)
ON CONFLICT (emp_id) DO NOTHING;

INSERT INTO part_time_employees (emp_id, department_name, hourly_rate, weekly_hours, schedule_type)
VALUES
('EMP-203', 'Supply Chain & Inventory', 32.50, 24, 'Morning / Lab Testing Shift'),
('EMP-204', 'Client Solutions', 28.00, 20, 'Afternoon / Client Demo Shift')
ON CONFLICT (emp_id) DO NOTHING;

INSERT INTO contractors (contractor_id, first_name, last_name, email, phone, agency_or_company, contract_rate, rate_type, project_assigned, contract_end_date, status)
VALUES
('CNT-301', 'Lukas', 'Novak', 'lukas.novak@apexembedded.com', '+1 (555) 789-1001', 'Apex Embedded Consulting', 95.00, 'hourly', 'PCIe Gen4 High-Speed Circuit Verification', '2026-12-31', 'Active'),
('CNT-302', 'Priya', 'Sundaram', 'priya.s@opticsflow.org', '+1 (555) 789-1002', 'OpticsFlow Engineering', 85.00, 'hourly', 'Firmware Driver Optimization for OLED Modules', '2026-11-30', 'Active')
ON CONFLICT (contractor_id) DO NOTHING;
