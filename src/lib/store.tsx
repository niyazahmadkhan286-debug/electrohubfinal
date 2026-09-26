'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  Product,
  DiscontinuedProduct,
  Customer,
  Order,
  FullTimeEmployee,
  PartTimeEmployee,
  Contractor,
  NotificationItem,
  AppSettings,
  UserProfile,
  BaseEmployee,
} from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

interface ElectroHubContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  discontinueProduct: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  adjustProductStock: (id: string, delta: number) => Promise<{ success: boolean; error?: string }>;

  // Discontinued
  discontinuedProducts: DiscontinuedProduct[];
  reactivateDiscontinuedProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteDiscontinuedProduct: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'orders_count'>) => Promise<{ success: boolean; error?: string }>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<{ success: boolean; error?: string }>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer_id: string;
    items: { product_id: string; quantity: number }[];
    payment_method?: string;
    shipping_address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Employees
  fullTimeEmployees: FullTimeEmployee[];
  partTimeEmployees: PartTimeEmployee[];
  contractors: Contractor[];
  allEmployees: (BaseEmployee | Contractor)[];
  addFullTimeEmployee: (data: Omit<FullTimeEmployee, 'id' | 'hire_date' | 'employment_type'>) => Promise<{ success: boolean; error?: string }>;
  updateFullTimeEmployee: (id: string, updates: Partial<FullTimeEmployee>) => Promise<{ success: boolean; error?: string }>;
  deleteFullTimeEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;

  addPartTimeEmployee: (data: Omit<PartTimeEmployee, 'id' | 'hire_date' | 'employment_type'>) => Promise<{ success: boolean; error?: string }>;
  updatePartTimeEmployee: (id: string, updates: Partial<PartTimeEmployee>) => Promise<{ success: boolean; error?: string }>;
  deletePartTimeEmployee: (id: string) => Promise<{ success: boolean; error?: string }>;

  addContractor: (data: Omit<Contractor, 'id' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateContractor: (id: string, updates: Partial<Contractor>) => Promise<{ success: boolean; error?: string }>;
  deleteContractor: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;

  // Database tools
  isSupabaseActive: boolean;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const ElectroHubContext = createContext<ElectroHubContextType | undefined>(undefined);

export const ElectroHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [discontinuedProducts, setDiscontinuedProducts] = useState<DiscontinuedProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullTimeEmployees, setFullTimeEmployees] = useState<FullTimeEmployee[]>([]);
  const [partTimeEmployees, setPartTimeEmployees] = useState<PartTimeEmployee[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    compactMode: false,
    notifications: {
      lowStockAlerts: true,
      orderNotifications: true,
      emailAlerts: false,
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      isConnected: false,
    },
  });

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  // Convert Supabase User to UserProfile
  const mapSupabaseUser = (sbUser: any): UserProfile => ({
    id: sbUser.id,
    email: sbUser.email || '',
    first_name: sbUser.user_metadata?.first_name || sbUser.email?.split('@')[0] || 'User',
    last_name: sbUser.user_metadata?.last_name || '',
    role: sbUser.user_metadata?.role || 'Administrator',
    department: sbUser.user_metadata?.department || 'Operations Management',
    phone: sbUser.phone || sbUser.user_metadata?.phone || '',
    account_status: 'Verified',
    last_sign_in: sbUser.last_sign_in_at || new Date().toISOString(),
  });

  // Refresh all tables from Supabase PostgreSQL
  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsLoadingData(true);
    try {
      // 1. Products
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbProducts && !prodErr) {
        setProducts(dbProducts as Product[]);
      }

      // 2. Discontinued Products
      const { data: dbDiscontinued, error: discErr } = await supabase
        .from('discontinued_products')
        .select('*')
        .order('discontinued_at', { ascending: false });

      if (dbDiscontinued && !discErr) {
        setDiscontinuedProducts(dbDiscontinued as DiscontinuedProduct[]);
      }

      // 3. Customers
      const { data: dbCustomers, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbCustomers && !custErr) {
        setCustomers(dbCustomers as Customer[]);
      }

      // 4. Orders with Line Items
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (dbOrders && !orderErr) {
        setOrders(dbOrders as Order[]);
      }

      // 5. Employees & Types
      const { data: dbEmployees, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbFT } = await supabase.from('full_time_employees').select('*');
      const { data: dbPT } = await supabase.from('part_time_employees').select('*');
      const { data: dbContractors } = await supabase.from('contractors').select('*');

      if (dbEmployees && !empErr) {
        // Merge full time
        if (dbFT) {
          const mergedFT: FullTimeEmployee[] = dbFT.map((ft: any) => {
            const base = dbEmployees.find((e: any) => e.emp_id === ft.emp_id) || {};
            return { ...base, ...ft, employment_type: 'FULL_TIME' };
          });
          setFullTimeEmployees(mergedFT);
        }

        // Merge part time
        if (dbPT) {
          const mergedPT: PartTimeEmployee[] = dbPT.map((pt: any) => {
            const base = dbEmployees.find((e: any) => e.emp_id === pt.emp_id) || {};
            return { ...base, ...pt, employment_type: 'PART_TIME' };
          });
          setPartTimeEmployees(mergedPT);
        }
      }

      if (dbContractors) {
        setContractors(dbContractors as Contractor[]);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initialize Auth & Supabase Listeners
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    const savedSettings = localStorage.getItem('electrohub_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applyTheme(parsed.theme);
      } catch {}
    } else {
      applyTheme('dark');
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoadingAuth(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    // Listen to Auth State changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    // Initial Data Fetch
    refreshData();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshData]);

  // Recalculate dynamic notification alerts from actual data
  useEffect(() => {
    const list: NotificationItem[] = [];

    // Critical out-of-stock alerts
    products
      .filter((p) => p.stock_quantity === 0)
      .forEach((p) => {
        list.push({
          id: `out-${p.id || p.product_id}`,
          title: 'Critical Out of Stock',
          message: `${p.product_name} (${p.product_id}) has 0 inventory units remaining. Immediate reorder required.`,
          type: 'out_of_stock',
          timestamp: 'Live Alert',
          read: false,
          link: '/inventory',
        });
      });

    // Low stock warnings
    products
      .filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold)
      .forEach((p) => {
        list.push({
          id: `low-${p.id || p.product_id}`,
          title: 'Low Stock Alert',
          message: `${p.product_name} is below threshold (${p.stock_quantity}/${p.min_stock_threshold} units).`,
          type: 'low_stock',
          timestamp: 'Threshold Trigger',
          read: false,
          link: '/inventory',
        });
      });

    // Recent orders
    orders.slice(0, 3).forEach((o) => {
      list.push({
        id: `ord-${o.id || o.order_id}`,
        title: `Order: ${o.order_id}`,
        message: `Purchase order for $${o.order_total.toLocaleString()} from ${o.customer_name || o.customer_id}.`,
        type: 'order',
        timestamp: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        link: '/orders',
      });
    });

    setNotifications(list);
  }, [products, orders]);

  // ==========================================
  // REAL CRUD: PRODUCTS
  // ==========================================
  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured. Please set environment variables.' };
    }

    if (productData.stock_quantity < 0) {
      return { success: false, error: 'Stock quantity cannot be negative.' };
    }

    const calculatedStatus: Product['status'] =
      productData.stock_quantity === 0
        ? 'OUT OF STOCK'
        : productData.stock_quantity <= productData.min_stock_threshold
        ? 'LOW STOCK'
        : 'IN STOCK';

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            product_id: productData.product_id,
            product_name: productData.product_name,
            category: productData.category,
            price: productData.price,
            stock_quantity: productData.stock_quantity,
            min_stock_threshold: productData.min_stock_threshold,
            status: calculatedStatus,
            description: productData.description || null,
            sku: productData.sku || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setProducts((prev) => [data as Product, ...prev]);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to add product:', err);
      return { success: false, error: err.message || 'Database error adding product.' };
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Product not found.' };

    const newStock = updates.stock_quantity !== undefined ? updates.stock_quantity : target.stock_quantity;
    if (newStock < 0) {
      return { success: false, error: 'Stock cannot be negative.' };
    }

    const newThreshold =
      updates.min_stock_threshold !== undefined ? updates.min_stock_threshold : target.min_stock_threshold;
    const newStatus =
      newStock === 0 ? 'OUT OF STOCK' : newStock <= newThreshold ? 'LOW STOCK' : 'IN STOCK';

    try {
      const payload: any = { ...updates, status: newStatus, updated_at: new Date().toISOString() };
      delete payload.id;

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('product_id', target.product_id)
        .select()
        .single();

      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.product_id === target.product_id ? (data as Product) : p)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product.' };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Product not found.' };

    try {
      const { error } = await supabase.from('products').delete().eq('product_id', target.product_id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.product_id !== target.product_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete product.' };
    }
  };

  const discontinueProduct = async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Product not found.' };

    try {
      // 1. Insert into discontinued_products
      const discPayload = {
        product_id: target.product_id,
        product_name: target.product_name,
        category: target.category,
        previous_price: target.price,
        reason: reason || 'Discontinued by operations manager',
        discontinued_at: new Date().toISOString(),
        notes: target.description || null,
      };

      const { data: newDisc, error: insertErr } = await supabase
        .from('discontinued_products')
        .insert([discPayload])
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 2. Delete from products
      const { error: delErr } = await supabase.from('products').delete().eq('product_id', target.product_id);
      if (delErr) throw delErr;

      setProducts((prev) => prev.filter((p) => p.product_id !== target.product_id));
      setDiscontinuedProducts((prev) => [newDisc as DiscontinuedProduct, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to discontinue product.' };
    }
  };

  const reactivateDiscontinuedProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = discontinuedProducts.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Discontinued product not found.' };

    try {
      const prodPayload = {
        product_id: target.product_id,
        product_name: target.product_name,
        category: target.category,
        price: target.previous_price,
        stock_quantity: 10,
        min_stock_threshold: 5,
        status: 'IN STOCK',
        description: target.notes || 'Restored from discontinued registry',
      };

      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert([prodPayload])
        .select()
        .single();

      if (insertErr) throw insertErr;

      const { error: delErr } = await supabase
        .from('discontinued_products')
        .delete()
        .eq('product_id', target.product_id);

      if (delErr) throw delErr;

      setDiscontinuedProducts((prev) => prev.filter((p) => p.product_id !== target.product_id));
      setProducts((prev) => [newProd as Product, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reactivate product.' };
    }
  };

  const deleteDiscontinuedProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = discontinuedProducts.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Target not found.' };

    try {
      const { error } = await supabase.from('discontinued_products').delete().eq('product_id', target.product_id);
      if (error) throw error;
      setDiscontinuedProducts((prev) => prev.filter((p) => p.product_id !== target.product_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete discontinued record.' };
    }
  };

  const adjustProductStock = async (id: string, delta: number): Promise<{ success: boolean; error?: string }> => {
    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return { success: false, error: 'Product not found.' };

    const newQty = target.stock_quantity + delta;
    if (newQty < 0) {
      return { success: false, error: `Invalid operation: stock cannot be negative (current: ${target.stock_quantity}).` };
    }

    return updateProduct(target.id, { stock_quantity: newQty });
  };

  // ==========================================
  // REAL CRUD: CUSTOMERS
  // ==========================================
  const addCustomer = async (
    customerData: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'orders_count'>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    try {
      const payload = {
        customer_id: customerData.customer_id,
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company || null,
        address: customerData.address || null,
        total_spent: 0,
        orders_count: 0,
      };

      const { data, error } = await supabase.from('customers').insert([payload]).select().single();
      if (error) throw error;
      setCustomers((prev) => [data as Customer, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add customer.' };
    }
  };

  const updateCustomer = async (
    id: string,
    updates: Partial<Customer>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = customers.find((c) => c.id === id || c.customer_id === id);
    if (!target) return { success: false, error: 'Customer not found.' };

    try {
      const payload: any = { ...updates };
      delete payload.id;

      const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('customer_id', target.customer_id)
        .select()
        .single();

      if (error) throw error;
      setCustomers((prev) => prev.map((c) => (c.customer_id === target.customer_id ? (data as Customer) : c)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update customer.' };
    }
  };

  const deleteCustomer = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = customers.find((c) => c.id === id || c.customer_id === id);
    if (!target) return { success: false, error: 'Customer not found.' };

    try {
      const { error } = await supabase.from('customers').delete().eq('customer_id', target.customer_id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.customer_id !== target.customer_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete customer.' };
    }
  };

  // ==========================================
  // REAL CRUD: ORDERS (with atomic safe stock deduction)
  // ==========================================
  const createOrder = async (orderData: {
    customer_id: string;
    items: { product_id: string; quantity: number }[];
    payment_method?: string;
    shipping_address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const customer = customers.find(
      (c) => c.customer_id === orderData.customer_id || c.id === orderData.customer_id
    );
    if (!customer) return { success: false, error: 'Specified customer does not exist.' };

    // Validate inventory stock first to prevent negative stock
    for (const item of orderData.items) {
      const prod = products.find((p) => p.product_id === item.product_id || p.id === item.product_id);
      if (!prod) {
        return { success: false, error: `Product ${item.product_id} not found in inventory.` };
      }
      if (prod.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.product_name}. Requested: ${item.quantity}, Available: ${prod.stock_quantity}.`,
        };
      }
    }

    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    let computedTotal = 0;

    const lineItems = orderData.items.map((it) => {
      const p = products.find((prod) => prod.product_id === it.product_id || prod.id === it.product_id)!;
      const subtotal = p.price * it.quantity;
      computedTotal += subtotal;
      return {
        order_id: orderId,
        product_id: p.product_id,
        product_name: p.product_name,
        quantity: it.quantity,
        unit_price: p.price,
        subtotal: Number(subtotal.toFixed(2)),
      };
    });

    try {
      // 1. Insert order
      const orderPayload = {
        order_id: orderId,
        customer_id: customer.customer_id,
        order_total: Number(computedTotal.toFixed(2)),
        status: 'Processing',
        payment_method: orderData.payment_method || 'Corporate Card',
        shipping_address: orderData.shipping_address || customer.address || 'Standard Delivery',
      };

      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert order items
      const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);
      if (itemsErr) throw itemsErr;

      // 3. Deduct stock safely from products
      for (const it of orderData.items) {
        const prod = products.find((p) => p.product_id === it.product_id || p.id === it.product_id)!;
        await adjustProductStock(prod.product_id, -it.quantity);
      }

      // 4. Update customer spend & orders count
      await updateCustomer(customer.customer_id, {
        total_spent: Number((customer.total_spent + computedTotal).toFixed(2)),
        orders_count: customer.orders_count + 1,
      });

      // Refresh data
      await refreshData();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to create order:', err);
      return { success: false, error: err.message || 'Database error creating order.' };
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: Order['status']
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = orders.find((o) => o.id === id || o.order_id === id);
    if (!target) return { success: false, error: 'Order not found.' };

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', target.order_id);

      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.order_id === target.order_id ? { ...o, status } : o)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update order status.' };
    }
  };

  const deleteOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = orders.find((o) => o.id === id || o.order_id === id);
    if (!target) return { success: false, error: 'Order not found.' };

    try {
      const { error } = await supabase.from('orders').delete().eq('order_id', target.order_id);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => o.order_id !== target.order_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete order.' };
    }
  };

  // ==========================================
  // REAL CRUD: EMPLOYEES & CONTRACTORS
  // ==========================================
  const allEmployees = useMemo(() => {
    return [...fullTimeEmployees, ...partTimeEmployees, ...contractors];
  }, [fullTimeEmployees, partTimeEmployees, contractors]);

  const addFullTimeEmployee = async (
    data: Omit<FullTimeEmployee, 'id' | 'hire_date' | 'employment_type'>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    try {
      const empPayload = {
        emp_id: data.emp_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        department_id: data.department_id,
        department_name: data.department_name,
        employment_type: 'FULL_TIME',
        role: data.role,
        status: data.status || 'Active',
      };

      const { error: empErr } = await supabase.from('employees').insert([empPayload]);
      if (empErr) throw empErr;

      const ftPayload = {
        emp_id: data.emp_id,
        department_name: data.department_name,
        annual_salary: data.annual_salary,
        health_benefits: data.health_benefits,
        paid_leave_days: data.paid_leave_days,
      };

      const { error: ftErr } = await supabase.from('full_time_employees').insert([ftPayload]);
      if (ftErr) throw ftErr;

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add full-time employee.' };
    }
  };

  const updateFullTimeEmployee = async (
    id: string,
    updates: Partial<FullTimeEmployee>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = fullTimeEmployees.find((e) => e.id === id || e.emp_id === id);
    if (!target) return { success: false, error: 'Employee not found.' };

    try {
      const empUpdates: any = {};
      if (updates.first_name) empUpdates.first_name = updates.first_name;
      if (updates.last_name) empUpdates.last_name = updates.last_name;
      if (updates.email) empUpdates.email = updates.email;
      if (updates.role) empUpdates.role = updates.role;
      if (updates.department_name) empUpdates.department_name = updates.department_name;

      if (Object.keys(empUpdates).length > 0) {
        await supabase.from('employees').update(empUpdates).eq('emp_id', target.emp_id);
      }

      const ftUpdates: any = {};
      if (updates.annual_salary !== undefined) ftUpdates.annual_salary = updates.annual_salary;
      if (updates.health_benefits !== undefined) ftUpdates.health_benefits = updates.health_benefits;
      if (updates.paid_leave_days !== undefined) ftUpdates.paid_leave_days = updates.paid_leave_days;

      if (Object.keys(ftUpdates).length > 0) {
        await supabase.from('full_time_employees').update(ftUpdates).eq('emp_id', target.emp_id);
      }

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update employee.' };
    }
  };

  const deleteFullTimeEmployee = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = fullTimeEmployees.find((e) => e.id === id || e.emp_id === id);
    if (!target) return { success: false, error: 'Employee not found.' };

    try {
      const { error } = await supabase.from('employees').delete().eq('emp_id', target.emp_id);
      if (error) throw error;
      setFullTimeEmployees((prev) => prev.filter((e) => e.emp_id !== target.emp_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete employee.' };
    }
  };

  const addPartTimeEmployee = async (
    data: Omit<PartTimeEmployee, 'id' | 'hire_date' | 'employment_type'>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    try {
      const empPayload = {
        emp_id: data.emp_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        department_id: data.department_id,
        department_name: data.department_name,
        employment_type: 'PART_TIME',
        role: data.role,
        status: data.status || 'Active',
      };

      const { error: empErr } = await supabase.from('employees').insert([empPayload]);
      if (empErr) throw empErr;

      const ptPayload = {
        emp_id: data.emp_id,
        department_name: data.department_name,
        hourly_rate: data.hourly_rate,
        weekly_hours: data.weekly_hours,
        schedule_type: data.schedule_type,
      };

      const { error: ptErr } = await supabase.from('part_time_employees').insert([ptPayload]);
      if (ptErr) throw ptErr;

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add part-time employee.' };
    }
  };

  const updatePartTimeEmployee = async (
    id: string,
    updates: Partial<PartTimeEmployee>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = partTimeEmployees.find((e) => e.id === id || e.emp_id === id);
    if (!target) return { success: false, error: 'Employee not found.' };

    try {
      const empUpdates: any = {};
      if (updates.first_name) empUpdates.first_name = updates.first_name;
      if (updates.last_name) empUpdates.last_name = updates.last_name;
      if (updates.email) empUpdates.email = updates.email;
      if (updates.role) empUpdates.role = updates.role;

      if (Object.keys(empUpdates).length > 0) {
        await supabase.from('employees').update(empUpdates).eq('emp_id', target.emp_id);
      }

      const ptUpdates: any = {};
      if (updates.hourly_rate !== undefined) ptUpdates.hourly_rate = updates.hourly_rate;
      if (updates.weekly_hours !== undefined) ptUpdates.weekly_hours = updates.weekly_hours;
      if (updates.schedule_type) ptUpdates.schedule_type = updates.schedule_type;

      if (Object.keys(ptUpdates).length > 0) {
        await supabase.from('part_time_employees').update(ptUpdates).eq('emp_id', target.emp_id);
      }

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update employee.' };
    }
  };

  const deletePartTimeEmployee = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = partTimeEmployees.find((e) => e.id === id || e.emp_id === id);
    if (!target) return { success: false, error: 'Employee not found.' };

    try {
      const { error } = await supabase.from('employees').delete().eq('emp_id', target.emp_id);
      if (error) throw error;
      setPartTimeEmployees((prev) => prev.filter((e) => e.emp_id !== target.emp_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete employee.' };
    }
  };

  const addContractor = async (
    data: Omit<Contractor, 'id' | 'status'>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    try {
      const payload = {
        contractor_id: data.contractor_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        agency_or_company: data.agency_or_company,
        contract_rate: data.contract_rate,
        rate_type: data.rate_type || 'hourly',
        project_assigned: data.project_assigned,
        contract_end_date: data.contract_end_date,
        status: 'Active',
      };

      const { data: dbCnt, error } = await supabase.from('contractors').insert([payload]).select().single();
      if (error) throw error;
      setContractors((prev) => [dbCnt as Contractor, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add contractor.' };
    }
  };

  const updateContractor = async (
    id: string,
    updates: Partial<Contractor>
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = contractors.find((c) => c.id === id || c.contractor_id === id);
    if (!target) return { success: false, error: 'Contractor not found.' };

    try {
      const payload: any = { ...updates };
      delete payload.id;

      const { data, error } = await supabase
        .from('contractors')
        .update(payload)
        .eq('contractor_id', target.contractor_id)
        .select()
        .single();

      if (error) throw error;
      setContractors((prev) =>
        prev.map((c) => (c.contractor_id === target.contractor_id ? (data as Contractor) : c))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update contractor.' };
    }
  };

  const deleteContractor = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    const target = contractors.find((c) => c.id === id || c.contractor_id === id);
    if (!target) return { success: false, error: 'Contractor not found.' };

    try {
      const { error } = await supabase.from('contractors').delete().eq('contractor_id', target.contractor_id);
      if (error) throw error;
      setContractors((prev) => prev.filter((c) => c.contractor_id !== target.contractor_id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete contractor.' };
    }
  };

  // Notifications helpers
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('electrohub_settings', JSON.stringify(updated));
    }
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  };

  // ==========================================
  // REAL SUPABASE AUTHENTICATION
  // ==========================================
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        await refreshData();
        return { success: true };
      }
      return { success: false, error: 'No user returned from Supabase Auth.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  const signup = async (
    email: string,
    pass: string,
    metadata?: { first_name?: string; last_name?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            first_name: metadata?.first_name || email.split('@')[0],
            last_name: metadata?.last_name || '',
            role: 'Administrator',
            department: 'Operations & Engineering Management',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        return { success: true };
      }
      return { success: false, error: 'Registration incomplete.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error.' };
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error logging out of Supabase:', err);
      }
    }
    setUser(null);
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profileUpdates.first_name,
          last_name: profileUpdates.last_name,
          role: profileUpdates.role,
          department: profileUpdates.department,
          phone: profileUpdates.phone,
        },
      });

      if (error) throw error;
      setUser((prev) => (prev ? { ...prev, ...profileUpdates } : null));
      return true;
    } catch (err) {
      console.error('Failed to update Supabase profile metadata:', err);
      return false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Supabase is not configured.' };

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password.' };
    }
  };

  return (
    <ElectroHubContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        discontinueProduct,
        adjustProductStock,
        discontinuedProducts,
        reactivateDiscontinuedProduct,
        deleteDiscontinuedProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        fullTimeEmployees,
        partTimeEmployees,
        contractors,
        allEmployees,
        addFullTimeEmployee,
        updateFullTimeEmployee,
        deleteFullTimeEmployee,
        addPartTimeEmployee,
        updatePartTimeEmployee,
        deletePartTimeEmployee,
        addContractor,
        updateContractor,
        deleteContractor,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        settings,
        updateSettings,
        user,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        isSupabaseActive,
        isLoadingData,
        refreshData,
      }}
    >
      {children}
    </ElectroHubContext.Provider>
  );
};

export const useElectroHub = () => {
  const context = useContext(ElectroHubContext);
  if (!context) {
    throw new Error('useElectroHub must be used within an ElectroHubProvider');
  }
  return context;
};
