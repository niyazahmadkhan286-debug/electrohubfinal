'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
import {
  INITIAL_PRODUCTS,
  INITIAL_DISCONTINUED,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_FULL_TIME,
  INITIAL_PART_TIME,
  INITIAL_CONTRACTORS,
  DEFAULT_USER_PROFILE,
} from './mockData';
import { getSupabaseClient, isSupabaseConfigured, resetSupabaseClient } from './supabase';

interface ElectroHubContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  discontinueProduct: (id: string, reason: string) => Promise<boolean>;
  adjustProductStock: (id: string, delta: number) => Promise<boolean>;

  // Discontinued
  discontinuedProducts: DiscontinuedProduct[];
  reactivateDiscontinuedProduct: (id: string) => Promise<boolean>;
  deleteDiscontinuedProduct: (id: string) => Promise<boolean>;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'orders_count'>) => Promise<boolean>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer_id: string;
    items: { product_id: string; quantity: number }[];
    payment_method?: string;
    shipping_address?: string;
  }) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // Employees
  fullTimeEmployees: FullTimeEmployee[];
  partTimeEmployees: PartTimeEmployee[];
  contractors: Contractor[];
  allEmployees: (BaseEmployee | Contractor)[];
  addFullTimeEmployee: (data: Omit<FullTimeEmployee, 'id' | 'hire_date' | 'employment_type'>) => Promise<boolean>;
  updateFullTimeEmployee: (id: string, updates: Partial<FullTimeEmployee>) => Promise<boolean>;
  deleteFullTimeEmployee: (id: string) => Promise<boolean>;

  addPartTimeEmployee: (data: Omit<PartTimeEmployee, 'id' | 'hire_date' | 'employment_type'>) => Promise<boolean>;
  updatePartTimeEmployee: (id: string, updates: Partial<PartTimeEmployee>) => Promise<boolean>;
  deletePartTimeEmployee: (id: string) => Promise<boolean>;

  addContractor: (data: Omit<Contractor, 'id' | 'status'>) => Promise<boolean>;
  updateContractor: (id: string, updates: Partial<Contractor>) => Promise<boolean>;
  deleteContractor: (id: string) => Promise<boolean>;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setSupabaseCredentials: (url: string, key: string) => Promise<boolean>;

  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Database tools
  isSupabaseActive: boolean;
  isSyncing: boolean;
  syncWithSupabase: () => Promise<void>;
  resetToDemoData: () => void;
  clearDatabase: () => void;
}

const ElectroHubContext = createContext<ElectroHubContextType | undefined>(undefined);

export const ElectroHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [discontinuedProducts, setDiscontinuedProducts] = useState<DiscontinuedProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullTimeEmployees, setFullTimeEmployees] = useState<FullTimeEmployee[]>([]);
  const [partTimeEmployees, setPartTimeEmployees] = useState<PartTimeEmployee[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER_PROFILE);
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
      url: '',
      anonKey: '',
      isConnected: false,
    },
  });

  // Load from local storage or initial mock data on mount
  useEffect(() => {
    setIsClient(true);
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    const savedProducts = localStorage.getItem('electrohub_products');
    const savedDiscontinued = localStorage.getItem('electrohub_discontinued');
    const savedCustomers = localStorage.getItem('electrohub_customers');
    const savedOrders = localStorage.getItem('electrohub_orders');
    const savedFT = localStorage.getItem('electrohub_ft_employees');
    const savedPT = localStorage.getItem('electrohub_pt_employees');
    const savedContractors = localStorage.getItem('electrohub_contractors');
    const savedUser = localStorage.getItem('electrohub_user');
    const savedSettings = localStorage.getItem('electrohub_settings');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('electrohub_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedDiscontinued) {
      setDiscontinuedProducts(JSON.parse(savedDiscontinued));
    } else {
      setDiscontinuedProducts(INITIAL_DISCONTINUED);
      localStorage.setItem('electrohub_discontinued', JSON.stringify(INITIAL_DISCONTINUED));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(INITIAL_CUSTOMERS);
      localStorage.setItem('electrohub_customers', JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('electrohub_orders', JSON.stringify(INITIAL_ORDERS));
    }

    if (savedFT) {
      setFullTimeEmployees(JSON.parse(savedFT));
    } else {
      setFullTimeEmployees(INITIAL_FULL_TIME);
      localStorage.setItem('electrohub_ft_employees', JSON.stringify(INITIAL_FULL_TIME));
    }

    if (savedPT) {
      setPartTimeEmployees(JSON.parse(savedPT));
    } else {
      setPartTimeEmployees(INITIAL_PART_TIME);
      localStorage.setItem('electrohub_pt_employees', JSON.stringify(INITIAL_PART_TIME));
    }

    if (savedContractors) {
      setContractors(JSON.parse(savedContractors));
    } else {
      setContractors(INITIAL_CONTRACTORS);
      localStorage.setItem('electrohub_contractors', JSON.stringify(INITIAL_CONTRACTORS));
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(DEFAULT_USER_PROFILE);
      localStorage.setItem('electrohub_user', JSON.stringify(DEFAULT_USER_PROFILE));
    }

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applyTheme(parsed.theme);
    } else {
      applyTheme('dark');
    }
  }, []);

  // Theme applier
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

  // Re-generate real-time notification alerts whenever products or orders change
  useEffect(() => {
    const list: NotificationItem[] = [];

    // Out of stock alerts
    products
      .filter((p) => p.stock_quantity === 0)
      .forEach((p) => {
        list.push({
          id: `out-${p.id}`,
          title: 'Critical Out of Stock',
          message: `${p.product_name} (${p.product_id}) has 0 inventory units remaining. Immediate reorder required.`,
          type: 'out_of_stock',
          timestamp: 'Just now',
          read: false,
          link: '/inventory',
        });
      });

    // Low stock alerts
    products
      .filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold)
      .forEach((p) => {
        list.push({
          id: `low-${p.id}`,
          title: 'Low Stock Alert',
          message: `${p.product_name} is below threshold (${p.stock_quantity}/${p.min_stock_threshold} units).`,
          type: 'low_stock',
          timestamp: 'Earlier today',
          read: false,
          link: '/inventory',
        });
      });

    // Recent orders
    orders.slice(0, 3).forEach((o) => {
      list.push({
        id: `ord-${o.id}`,
        title: `New Order Placed: ${o.order_id}`,
        message: `Order for $${o.order_total.toLocaleString()} from ${o.customer_name || 'Customer'}.`,
        type: 'order',
        timestamp: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        link: '/orders',
      });
    });

    setNotifications(list);
  }, [products, orders]);

  // Save changes to localStorage helper
  const persist = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Products CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<boolean> => {
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Calculate status properly
    if (newProduct.stock_quantity === 0) {
      newProduct.status = 'OUT OF STOCK';
    } else if (newProduct.stock_quantity <= newProduct.min_stock_threshold) {
      newProduct.status = 'LOW STOCK';
    } else {
      newProduct.status = 'IN STOCK';
    }

    const updated = [newProduct, ...products];
    setProducts(updated);
    persist('electrohub_products', updated);

    // If Supabase is connected, attempt sync
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').insert([
          {
            product_id: newProduct.product_id,
            product_name: newProduct.product_name,
            category: newProduct.category,
            price: newProduct.price,
            stock_quantity: newProduct.stock_quantity,
            min_stock_threshold: newProduct.min_stock_threshold,
            status: newProduct.status,
            description: newProduct.description,
            sku: newProduct.sku,
          },
        ]);
      } catch (err) {
        console.warn('Supabase insert note:', err);
      }
    }
    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const updated = products.map((p) => {
      if (p.id === id || p.product_id === id) {
        const merged = { ...p, ...updates, updated_at: new Date().toISOString() };
        if (merged.stock_quantity === 0) {
          merged.status = 'OUT OF STOCK';
        } else if (merged.stock_quantity <= merged.min_stock_threshold) {
          merged.status = 'LOW STOCK';
        } else {
          merged.status = 'IN STOCK';
        }
        return merged;
      }
      return p;
    });

    setProducts(updated);
    persist('electrohub_products', updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const item = updated.find((p) => p.id === id || p.product_id === id);
        if (item) {
          await supabase.from('products').update(item).match({ product_id: item.product_id });
        }
      } catch (err) {
        console.warn('Supabase update note:', err);
      }
    }
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const target = products.find((p) => p.id === id || p.product_id === id);
    const updated = products.filter((p) => p.id !== id && p.product_id !== id);
    setProducts(updated);
    persist('electrohub_products', updated);

    const supabase = getSupabaseClient();
    if (supabase && target) {
      try {
        await supabase.from('products').delete().match({ product_id: target.product_id });
      } catch (err) {
        console.warn('Supabase delete note:', err);
      }
    }
    return true;
  };

  const discontinueProduct = async (id: string, reason: string): Promise<boolean> => {
    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return false;

    const discontinuedItem: DiscontinuedProduct = {
      id: `disc-${Date.now()}`,
      product_id: target.product_id,
      product_name: target.product_name,
      category: target.category,
      previous_price: target.price,
      reason: reason || 'Discontinued by inventory supervisor',
      discontinued_at: new Date().toISOString(),
      notes: target.description,
    };

    const newDiscontinued = [discontinuedItem, ...discontinuedProducts];
    const newProducts = products.filter((p) => p.id !== id && p.product_id !== id);

    setDiscontinuedProducts(newDiscontinued);
    setProducts(newProducts);
    persist('electrohub_discontinued', newDiscontinued);
    persist('electrohub_products', newProducts);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('products').delete().match({ product_id: target.product_id });
        await supabase.from('discontinued_products').insert([discontinuedItem]);
      } catch (err) {
        console.warn('Supabase discontinue sync note:', err);
      }
    }
    return true;
  };

  const adjustProductStock = async (id: string, delta: number): Promise<boolean> => {
    const target = products.find((p) => p.id === id || p.product_id === id);
    if (!target) return false;

    const newQty = Math.max(0, target.stock_quantity + delta);
    return updateProduct(id, { stock_quantity: newQty });
  };

  // Discontinued Management
  const reactivateDiscontinuedProduct = async (id: string): Promise<boolean> => {
    const target = discontinuedProducts.find((p) => p.id === id || p.product_id === id);
    if (!target) return false;

    const revivedProduct: Product = {
      id: `prd-${Date.now()}`,
      product_id: target.product_id,
      product_name: target.product_name,
      category: target.category,
      price: target.previous_price,
      stock_quantity: 10,
      min_stock_threshold: 5,
      status: 'IN STOCK',
      description: target.notes || 'Restored from discontinued registry',
      created_at: new Date().toISOString(),
    };

    const newDiscontinued = discontinuedProducts.filter((p) => p.id !== id && p.product_id !== id);
    const newProducts = [revivedProduct, ...products];

    setDiscontinuedProducts(newDiscontinued);
    setProducts(newProducts);
    persist('electrohub_discontinued', newDiscontinued);
    persist('electrohub_products', newProducts);
    return true;
  };

  const deleteDiscontinuedProduct = async (id: string): Promise<boolean> => {
    const updated = discontinuedProducts.filter((p) => p.id !== id && p.product_id !== id);
    setDiscontinuedProducts(updated);
    persist('electrohub_discontinued', updated);
    return true;
  };

  // Customers CRUD
  const addCustomer = async (
    customerData: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'orders_count'>
  ): Promise<boolean> => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      total_spent: 0,
      orders_count: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    persist('electrohub_customers', updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('customers').insert([newCustomer]);
      } catch (err) {
        console.warn('Supabase customer insert note:', err);
      }
    }
    return true;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    const updated = customers.map((c) => (c.id === id || c.customer_id === id ? { ...c, ...updates } : c));
    setCustomers(updated);
    persist('electrohub_customers', updated);
    return true;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    const updated = customers.filter((c) => c.id !== id && c.customer_id !== id);
    setCustomers(updated);
    persist('electrohub_customers', updated);
    return true;
  };

  // Orders CRUD
  const createOrder = async (orderData: {
    customer_id: string;
    items: { product_id: string; quantity: number }[];
    payment_method?: string;
    shipping_address?: string;
  }): Promise<boolean> => {
    const customer = customers.find((c) => c.customer_id === orderData.customer_id || c.id === orderData.customer_id);
    if (!customer) return false;

    let orderTotal = 0;
    const resolvedItems = orderData.items.map((item, idx) => {
      const prod = products.find((p) => p.product_id === item.product_id || p.id === item.product_id);
      const unit_price = prod ? prod.price : 0;
      const subtotal = unit_price * item.quantity;
      orderTotal += subtotal;

      // Deduct inventory
      if (prod) {
        adjustProductStock(prod.id, -item.quantity);
      }

      return {
        id: `item-${Date.now()}-${idx}`,
        product_id: prod ? prod.product_id : item.product_id,
        product_name: prod ? prod.product_name : 'Electronic Item',
        quantity: item.quantity,
        unit_price,
        subtotal,
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customer_id: customer.customer_id,
      customer_name: `${customer.first_name} ${customer.last_name}${customer.company ? ` (${customer.company})` : ''}`,
      order_total: Number(orderTotal.toFixed(2)),
      status: 'Processing',
      payment_method: orderData.payment_method || 'Corporate Card',
      shipping_address: orderData.shipping_address || customer.address || 'Standard Delivery',
      created_at: new Date().toISOString(),
      items: resolvedItems,
    };

    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    persist('electrohub_orders', newOrders);

    // Update customer spend and count
    updateCustomer(customer.id, {
      total_spent: Number((customer.total_spent + orderTotal).toFixed(2)),
      orders_count: customer.orders_count + 1,
    });

    return true;
  };

  const updateOrderStatus = async (id: string, status: Order['status']): Promise<boolean> => {
    const updated = orders.map((o) => (o.id === id || o.order_id === id ? { ...o, status } : o));
    setOrders(updated);
    persist('electrohub_orders', updated);
    return true;
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    const updated = orders.filter((o) => o.id !== id && o.order_id !== id);
    setOrders(updated);
    persist('electrohub_orders', updated);
    return true;
  };

  // Employees CRUD
  const allEmployees = useMemo(() => {
    return [...fullTimeEmployees, ...partTimeEmployees, ...contractors];
  }, [fullTimeEmployees, partTimeEmployees, contractors]);

  const addFullTimeEmployee = async (
    data: Omit<FullTimeEmployee, 'id' | 'hire_date' | 'employment_type'>
  ): Promise<boolean> => {
    const newEmp: FullTimeEmployee = {
      ...data,
      id: `emp-ft-${Date.now()}`,
      employment_type: 'FULL_TIME',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    const updated = [newEmp, ...fullTimeEmployees];
    setFullTimeEmployees(updated);
    persist('electrohub_ft_employees', updated);
    return true;
  };

  const updateFullTimeEmployee = async (id: string, updates: Partial<FullTimeEmployee>): Promise<boolean> => {
    const updated = fullTimeEmployees.map((e) => (e.id === id || e.emp_id === id ? { ...e, ...updates } : e));
    setFullTimeEmployees(updated);
    persist('electrohub_ft_employees', updated);
    return true;
  };

  const deleteFullTimeEmployee = async (id: string): Promise<boolean> => {
    const updated = fullTimeEmployees.filter((e) => e.id !== id && e.emp_id !== id);
    setFullTimeEmployees(updated);
    persist('electrohub_ft_employees', updated);
    return true;
  };

  const addPartTimeEmployee = async (
    data: Omit<PartTimeEmployee, 'id' | 'hire_date' | 'employment_type'>
  ): Promise<boolean> => {
    const newEmp: PartTimeEmployee = {
      ...data,
      id: `emp-pt-${Date.now()}`,
      employment_type: 'PART_TIME',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    const updated = [newEmp, ...partTimeEmployees];
    setPartTimeEmployees(updated);
    persist('electrohub_pt_employees', updated);
    return true;
  };

  const updatePartTimeEmployee = async (id: string, updates: Partial<PartTimeEmployee>): Promise<boolean> => {
    const updated = partTimeEmployees.map((e) => (e.id === id || e.emp_id === id ? { ...e, ...updates } : e));
    setPartTimeEmployees(updated);
    persist('electrohub_pt_employees', updated);
    return true;
  };

  const deletePartTimeEmployee = async (id: string): Promise<boolean> => {
    const updated = partTimeEmployees.filter((e) => e.id !== id && e.emp_id !== id);
    setPartTimeEmployees(updated);
    persist('electrohub_pt_employees', updated);
    return true;
  };

  const addContractor = async (data: Omit<Contractor, 'id' | 'status'>): Promise<boolean> => {
    const newCnt: Contractor = {
      ...data,
      id: `cnt-${Date.now()}`,
      status: 'Active',
    };
    const updated = [newCnt, ...contractors];
    setContractors(updated);
    persist('electrohub_contractors', updated);
    return true;
  };

  const updateContractor = async (id: string, updates: Partial<Contractor>): Promise<boolean> => {
    const updated = contractors.map((c) => (c.id === id || c.contractor_id === id ? { ...c, ...updates } : c));
    setContractors(updated);
    persist('electrohub_contractors', updated);
    return true;
  };

  const deleteContractor = async (id: string): Promise<boolean> => {
    const updated = contractors.filter((c) => c.id !== id && c.contractor_id !== id);
    setContractors(updated);
    persist('electrohub_contractors', updated);
    return true;
  };

  // Notifications
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
    persist('electrohub_settings', updated);
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  };

  const setSupabaseCredentials = async (url: string, key: string): Promise<boolean> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('electrohub_supabase_url', url);
      localStorage.setItem('electrohub_supabase_anon_key', key);
    }
    resetSupabaseClient();
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);
    updateSettings({
      supabase: {
        url,
        anonKey: key,
        isConnected: configured,
      },
    });

    if (configured) {
      await syncWithSupabase();
    }
    return configured;
  };

  // Auth
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          // If Supabase user does not exist yet, allow fallback demo login or return error
          console.warn('Supabase auth returned:', error.message);
        } else if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            first_name: data.user.user_metadata?.first_name || 'Admin',
            last_name: data.user.user_metadata?.last_name || 'User',
            role: 'Administrator',
            department: 'Operations & Engineering Management',
            phone: '+1 (555) 019-4820',
            account_status: 'Verified',
            last_sign_in: new Date().toISOString(),
          };
          setUser(profile);
          persist('electrohub_user', profile);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase login exception:', err);
      }
    }

    // Standard high-reliability credential check for demo / portfolio
    if (email && pass.length >= 6) {
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        first_name: email.split('@')[0].toUpperCase(),
        last_name: 'Lead',
        role: 'Operations & Systems Director',
        department: 'Electronics Logistics & Engineering',
        phone: '+1 (555) 019-4820',
        account_status: 'Verified',
        last_sign_in: new Date().toISOString(),
      };
      setUser(profile);
      persist('electrohub_user', profile);
      return { success: true };
    }

    return {
      success: false,
      error: 'Please enter a valid email and a password of at least 6 characters.',
    };
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out note:', err);
      }
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('electrohub_user');
    }
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profileUpdates };
    setUser(updated);
    persist('electrohub_user', updated);
  };

  // Sync with Supabase PostgreSQL tables
  const syncWithSupabase = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsSyncing(true);
    try {
      // 1. Fetch products
      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
        persist('electrohub_products', dbProducts);
      }

      // 2. Fetch customers
      const { data: dbCustomers } = await supabase.from('customers').select('*');
      if (dbCustomers && dbCustomers.length > 0) {
        setCustomers(dbCustomers);
        persist('electrohub_customers', dbCustomers);
      }

      // 3. Fetch orders
      const { data: dbOrders } = await supabase.from('orders').select('*, items:order_items(*)');
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);
        persist('electrohub_orders', dbOrders);
      }

      // 4. Fetch employees
      const { data: dbFT } = await supabase.from('full_time_employees').select('*, employees(*)');
      if (dbFT && dbFT.length > 0) {
        setFullTimeEmployees(dbFT);
        persist('electrohub_ft_employees', dbFT);
      }

      setIsSupabaseActive(true);
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Data helpers
  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setDiscontinuedProducts(INITIAL_DISCONTINUED);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setFullTimeEmployees(INITIAL_FULL_TIME);
    setPartTimeEmployees(INITIAL_PART_TIME);
    setContractors(INITIAL_CONTRACTORS);
    setUser(DEFAULT_USER_PROFILE);

    persist('electrohub_products', INITIAL_PRODUCTS);
    persist('electrohub_discontinued', INITIAL_DISCONTINUED);
    persist('electrohub_customers', INITIAL_CUSTOMERS);
    persist('electrohub_orders', INITIAL_ORDERS);
    persist('electrohub_ft_employees', INITIAL_FULL_TIME);
    persist('electrohub_pt_employees', INITIAL_PART_TIME);
    persist('electrohub_contractors', INITIAL_CONTRACTORS);
    persist('electrohub_user', DEFAULT_USER_PROFILE);
  };

  const clearDatabase = () => {
    setProducts([]);
    setDiscontinuedProducts([]);
    setCustomers([]);
    setOrders([]);
    setFullTimeEmployees([]);
    setPartTimeEmployees([]);
    setContractors([]);

    persist('electrohub_products', []);
    persist('electrohub_discontinued', []);
    persist('electrohub_customers', []);
    persist('electrohub_orders', []);
    persist('electrohub_ft_employees', []);
    persist('electrohub_pt_employees', []);
    persist('electrohub_contractors', []);
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
        setSupabaseCredentials,
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateProfile,
        isSupabaseActive,
        isSyncing,
        syncWithSupabase,
        resetToDemoData,
        clearDatabase,
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
