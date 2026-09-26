export type ProductCategory =
  | 'Microcontrollers & ICs'
  | 'Sensors & Modules'
  | 'Displays & Optoelectronics'
  | 'Power & Batteries'
  | 'Wireless & IoT'
  | 'Computer Hardware & GPUs'
  | 'Audio & Peripherals'
  | 'Robotics & Motors'
  | 'Test & Measurement'
  | 'Tools & Soldering';

export type ProductStatus = 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';

export interface Product {
  id: string; // Internal UUID
  product_id: string; // e.g. "PRD-1001"
  product_name: string;
  category: ProductCategory;
  price: number;
  stock_quantity: number;
  min_stock_threshold: number;
  status: ProductStatus;
  description?: string;
  sku?: string;
  created_at: string;
  updated_at?: string;
}

export interface DiscontinuedProduct {
  id: string;
  product_id: string;
  product_name: string;
  category: ProductCategory;
  previous_price: number;
  reason: string;
  discontinued_at: string;
  notes?: string;
}

export interface Customer {
  id: string;
  customer_id: string; // e.g. "CUST-5001"
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  total_spent: number;
  orders_count: number;
  created_at: string;
}

export type OrderStatus = 'Completed' | 'Processing' | 'Pending' | 'Cancelled';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_id: string; // e.g. "ORD-9021"
  customer_id: string;
  customer_name?: string;
  order_total: number;
  status: OrderStatus;
  payment_method?: string;
  shipping_address?: string;
  items: OrderItem[];
  created_at: string;
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';

export interface BaseEmployee {
  id: string;
  emp_id: string; // e.g. "EMP-2001"
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: string;
  department_name: string;
  employment_type: EmploymentType;
  role: string;
  hire_date: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface FullTimeEmployee extends BaseEmployee {
  employment_type: 'FULL_TIME';
  annual_salary: number;
  health_benefits: boolean;
  paid_leave_days: number;
}

export interface PartTimeEmployee extends BaseEmployee {
  employment_type: 'PART_TIME';
  hourly_rate: number;
  weekly_hours: number;
  schedule_type: string;
}

export interface Contractor {
  id: string;
  contractor_id: string; // e.g. "CNT-7001"
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  agency_or_company: string;
  contract_rate: number; // hourly or daily
  rate_type: 'hourly' | 'daily' | 'project';
  project_assigned: string;
  contract_end_date: string;
  status: 'Active' | 'Expired';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'out_of_stock' | 'order' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  notifications: {
    lowStockAlerts: boolean;
    orderNotifications: boolean;
    emailAlerts: boolean;
  };
  supabase: {
    url: string;
    anonKey: string;
    isConnected: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  phone: string;
  avatar_url?: string;
  account_status: 'Active' | 'Verified' | 'Pending';
  last_sign_in: string;
}
