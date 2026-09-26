'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  Users,
  ShoppingBag,
  Briefcase,
  AlertTriangle,
  AlertCircle,
  Archive,
  DollarSign,
  Plus,
  Boxes,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { OrderTrendChart, CategoryBarChart, StockStatusChart } from '@/components/charts/Charts';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = [
  'Microcontrollers & ICs',
  'Sensors & Modules',
  'Displays & Optoelectronics',
  'Power & Batteries',
  'Wireless & IoT',
  'Computer Hardware & GPUs',
  'Audio & Peripherals',
  'Robotics & Motors',
  'Test & Measurement',
  'Tools & Soldering',
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    products,
    customers,
    orders,
    allEmployees,
    discontinuedProducts,
    addProduct,
    addCustomer,
    createOrder,
    resetToDemoData,
  } = useElectroHub();

  // Quick Action Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // Form states: Product
  const [newProdId, setNewProdId] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Microcontrollers & ICs');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdThreshold, setNewProdThreshold] = useState('10');

  // Form states: Customer
  const [newCustId, setNewCustId] = useState('');
  const [newCustFirst, setNewCustFirst] = useState('');
  const [newCustLast, setNewCustLast] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');

  // Form states: Order
  const [orderCustId, setOrderCustId] = useState('');
  const [orderProdId, setOrderProdId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('1');

  // Metric calculations
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalEmployees = allEmployees.length;

  const lowStockList = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold
  );
  const lowStockCount = lowStockList.length;

  const outOfStockList = products.filter((p) => p.stock_quantity === 0);
  const outOfStockCount = outOfStockList.length;

  const inStockCount = products.filter((p) => p.stock_quantity > p.min_stock_threshold).length;

  const discontinuedCount = discontinuedProducts.length;

  const totalOrderValue = orders.reduce((acc, curr) => acc + curr.order_total, 0);

  // Category chart data
  const categoryCounts = CATEGORIES.map((cat) => ({
    category: cat,
    count: products.filter((p) => p.category === cat).length,
  })).filter((c) => c.count > 0);

  // Order trend data (dynamically computed from orders)
  const orderTrendsData = orders.slice(0, 6).map((ord) => ({
    label: ord.order_id,
    value: ord.order_total,
    orders: ord.items ? ord.items.length : 1,
  }));

  // Handle Add Product submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdId || !newProdName || !newProdPrice) {
      showToast.error('Validation Error', 'Please complete all required product fields.');
      return;
    }

    const price = parseFloat(newProdPrice);
    const stock = parseInt(newProdStock, 10) || 0;
    const threshold = parseInt(newProdThreshold, 10) || 10;

    await addProduct({
      product_id: newProdId.trim().toUpperCase(),
      product_name: newProdName.trim(),
      category: newProdCategory,
      price,
      stock_quantity: stock,
      min_stock_threshold: threshold,
      status: stock === 0 ? 'OUT OF STOCK' : stock <= threshold ? 'LOW STOCK' : 'IN STOCK',
    });

    showToast.success('Product Added', `${newProdName} has been cataloged.`);
    setIsAddProductOpen(false);
    setNewProdId('');
    setNewProdName('');
    setNewProdPrice('');
  };

  // Handle Add Customer submit
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustId || !newCustFirst || !newCustLast || !newCustEmail) {
      showToast.error('Validation Error', 'Please fill in required customer details.');
      return;
    }

    await addCustomer({
      customer_id: newCustId.trim().toUpperCase(),
      first_name: newCustFirst.trim(),
      last_name: newCustLast.trim(),
      email: newCustEmail.trim(),
      phone: newCustPhone.trim() || '+1 (555) 000-0000',
      company: newCustCompany.trim() || undefined,
    });

    showToast.success('Customer Registered', `${newCustFirst} ${newCustLast} has been added.`);
    setIsAddCustomerOpen(false);
    setNewCustId('');
    setNewCustFirst('');
    setNewCustLast('');
    setNewCustEmail('');
    setNewCustCompany('');
  };

  // Handle Create Order submit
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCust = orderCustId || (customers[0] ? customers[0].customer_id : '');
    const targetProd = orderProdId || (products[0] ? products[0].product_id : '');
    const qty = parseInt(orderQuantity, 10) || 1;

    if (!targetCust || !targetProd) {
      showToast.error('Order Creation Failed', 'Please select both a customer and an electronic item.');
      return;
    }

    const prodObj = products.find((p) => p.product_id === targetProd || p.id === targetProd);
    if (prodObj && prodObj.stock_quantity < qty) {
      showToast.error('Insufficient Stock', `Only ${prodObj.stock_quantity} units available.`);
      return;
    }

    const success = await createOrder({
      customer_id: targetCust,
      items: [{ product_id: targetProd, quantity: qty }],
    });

    if (success) {
      showToast.success('Order Generated', 'Inventory adjusted and purchase order created.');
      setIsCreateOrderOpen(false);
    }
  };

  const isDatabaseEmpty =
    totalProducts === 0 && totalCustomers === 0 && totalOrders === 0 && totalEmployees === 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Quick Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">System Operations Dashboard</h2>
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full font-medium">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring of electronics inventory, active orders, client pipelines, and personnel.
            </p>
          </div>

          {/* Quick Action Buttons (NO DEAD BUTTONS) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewProdId(`PRD-${Math.floor(100 + Math.random() * 900)}`);
                setIsAddProductOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => {
                setNewCustId(`CUST-${Math.floor(100 + Math.random() * 900)}`);
                setIsAddCustomerOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Customer</span>
            </button>

            <button
              onClick={() => {
                if (products.length === 0 || customers.length === 0) {
                  showToast.warning('Cannot create order', 'Add at least one product and customer first.');
                  return;
                }
                setOrderCustId(customers[0]?.customer_id || '');
                setOrderProdId(products[0]?.product_id || '');
                setIsCreateOrderOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Create Order</span>
            </button>

            <button
              onClick={() => router.push('/inventory')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>View Inventory</span>
            </button>
          </div>
        </div>

        {/* Empty State when Database is completely reset */}
        {isDatabaseEmpty && (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-dashed border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">Database is Currently Empty</h3>
              <p className="text-xs text-slate-400 mt-1">
                No products, customers, orders or employees found. You can add your first record manually or load the initial electronics dataset.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setNewProdId('PRD-101');
                  setIsAddProductOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Add Your First Product
              </button>
              <button
                onClick={resetToDemoData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Load Electronics Demo Dataset
              </button>
            </div>
          </div>
        )}

        {/* TOP STATISTICS GRID (8 Cards with Icon, Number, Label, Small context, Hover animation) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Products */}
          <StatCard
            label="Total Products"
            value={totalProducts}
            icon={Cpu}
            accentColor="blue"
            contextText={`${inStockCount} in stock ready`}
            trend={{ value: `${totalProducts} cataloged`, isPositive: true }}
            onClick={() => router.push('/products')}
          />

          {/* 2. Total Customers */}
          <StatCard
            label="Total Customers"
            value={totalCustomers}
            icon={Users}
            accentColor="emerald"
            contextText="Corporate & Research Labs"
            trend={{ value: `${totalCustomers} active`, isPositive: true }}
            onClick={() => router.push('/customers')}
          />

          {/* 3. Total Orders */}
          <StatCard
            label="Total Orders"
            value={totalOrders}
            icon={ShoppingBag}
            accentColor="cyan"
            contextText="Processed through system"
            trend={{ value: `${totalOrders} lifetime`, isPositive: true }}
            onClick={() => router.push('/orders')}
          />

          {/* 4. Total Employees */}
          <StatCard
            label="Total Employees"
            value={totalEmployees}
            icon={Briefcase}
            accentColor="indigo"
            contextText="Full-time, Part-time & Contractors"
            trend={{ value: `${totalEmployees} staff`, isPositive: true }}
            onClick={() => router.push('/employees')}
          />

          {/* 5. Low Stock */}
          <StatCard
            label="Low Stock Alerts"
            value={lowStockCount}
            icon={AlertTriangle}
            accentColor="amber"
            contextText="Below minimum threshold"
            trend={{ value: 'Action Required', isWarning: lowStockCount > 0 }}
            onClick={() => router.push('/inventory')}
          />

          {/* 6. Out of Stock */}
          <StatCard
            label="Out of Stock"
            value={outOfStockCount}
            icon={AlertCircle}
            accentColor="rose"
            contextText="Zero inventory balance"
            trend={{ value: 'Critical', isWarning: outOfStockCount > 0 }}
            onClick={() => router.push('/inventory')}
          />

          {/* 7. Discontinued Products */}
          <StatCard
            label="Discontinued Products"
            value={discontinuedCount}
            icon={Archive}
            accentColor="purple"
            contextText="Retired hardware components"
            trend={{ value: 'Archived' }}
            onClick={() => router.push('/discontinued-products')}
          />

          {/* 8. Total Order Value */}
          <StatCard
            label="Total Order Value"
            value={`$${totalOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            accentColor="emerald"
            contextText="Cumulative gross revenue"
            trend={{ value: 'Verified GMV', isPositive: true }}
            onClick={() => router.push('/analytics')}
          />
        </div>

        {/* DASHBOARD ANALYTICS CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderTrendChart
              data={
                orderTrendsData.length > 0
                  ? orderTrendsData
                  : [{ label: 'Cycle 1', value: 0, orders: 0 }]
              }
              title="Recent Order Trends & Revenue"
            />
          </div>

          <div>
            <StockStatusChart
              inStock={inStockCount}
              lowStock={lowStockCount}
              outOfStock={outOfStockCount}
            />
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION & RECENT ACTIVITY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Chart */}
          <div className="lg:col-span-1">
            <CategoryBarChart data={categoryCounts} />
          </div>

          {/* Recent Activity: Orders & Low Stock */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Orders */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">Recent Orders</h4>
                </div>
                <Link href="/orders" className="text-xs text-blue-400 hover:underline">
                  View All &rarr;
                </Link>
              </div>

              <div className="flex-1 space-y-2.5">
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No orders registered yet. Click &quot;Create Order&quot; above.
                  </div>
                ) : (
                  orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{order.order_id}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {order.customer_name || order.customer_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400">${order.order_total.toFixed(2)}</p>
                        <Badge
                          size="sm"
                          variant={
                            order.status === 'Completed'
                              ? 'success'
                              : order.status === 'Processing'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock & Attention Products */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-white">Stock Warnings</h4>
                </div>
                <Link href="/inventory" className="text-xs text-amber-400 hover:underline">
                  Manage &rarr;
                </Link>
              </div>

              <div className="flex-1 space-y-2.5">
                {lowStockList.length === 0 && outOfStockList.length === 0 ? (
                  <div className="py-8 text-center text-emerald-400/80 text-xs">
                    All inventory levels are currently above minimum threshold.
                  </div>
                ) : (
                  [...outOfStockList, ...lowStockList].slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-white truncate">{item.product_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.product_id} &bull; Min: {item.min_stock_threshold} units
                        </p>
                      </div>
                      <Badge
                        size="sm"
                        variant={item.status === 'OUT OF STOCK' ? 'danger' : 'warning'}
                        pulse={item.status === 'OUT OF STOCK'}
                      >
                        {item.stock_quantity} Left
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added Products List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Recently Added Components</h4>
              <p className="text-xs text-slate-400">Latest electronics and semiconductor additions</p>
            </div>
            <Link
              href="/products"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">No active products in catalog.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Product ID</th>
                    <th className="pb-3">Component Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Unit Price</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {products.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-2 font-mono font-medium text-blue-400">{p.product_id}</td>
                      <td className="py-3 font-medium text-white max-w-[240px] truncate">{p.product_name}</td>
                      <td className="py-3 text-slate-400">{p.category}</td>
                      <td className="py-3 text-slate-300 font-semibold">${p.price.toFixed(2)}</td>
                      <td className="py-3 font-semibold text-slate-200">{p.stock_quantity} units</td>
                      <td className="py-3 pr-2 text-right">
                        <Badge
                          size="sm"
                          variant={
                            p.status === 'IN STOCK'
                              ? 'success'
                              : p.status === 'LOW STOCK'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD PRODUCT */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="Add New Electronics Component"
        subtitle="Registers an item in the PostgreSQL catalog"
      >
        <form onSubmit={handleAddProductSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Product ID *</label>
              <input
                type="text"
                required
                value={newProdId}
                onChange={(e) => setNewProdId(e.target.value)}
                placeholder="PRD-111"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                placeholder="29.99"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="ESP32-WROOM Microcontroller"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
            <select
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Stock Units</label>
              <input
                type="number"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reorder Threshold</label>
              <input
                type="number"
                value={newProdThreshold}
                onChange={(e) => setNewProdThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CUSTOMER */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add Customer Account"
        subtitle="Registers an enterprise client or distributor"
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer ID *</label>
              <input
                type="text"
                required
                value={newCustId}
                onChange={(e) => setNewCustId(e.target.value)}
                placeholder="CUST-105"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Lab</label>
              <input
                type="text"
                value={newCustCompany}
                onChange={(e) => setNewCustCompany(e.target.value)}
                placeholder="Apex Robotics"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newCustFirst}
                onChange={(e) => setNewCustFirst(e.target.value)}
                placeholder="Lucas"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newCustLast}
                onChange={(e) => setNewCustLast(e.target.value)}
                placeholder="Scott"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email *</label>
              <input
                type="email"
                required
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="lucas@apexrobotics.io"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="+1 (555) 302-9901"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE ORDER */}
      <Modal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        title="Create Electronic Purchase Order"
        subtitle="Deducts component inventory in real-time"
      >
        <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Customer *</label>
            <select
              value={orderCustId}
              onChange={(e) => setOrderCustId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.customer_id}>
                  {c.customer_id} &mdash; {c.first_name} {c.last_name} ({c.company || 'Direct'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Product *</label>
            <select
              value={orderProdId}
              onChange={(e) => setOrderProdId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.product_id} disabled={p.stock_quantity === 0}>
                  {p.product_id} &mdash; {p.product_name} (${p.price.toFixed(2)}) &bull; {p.stock_quantity} available
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity to Purchase</label>
            <input
              type="number"
              min="1"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOrderOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Confirm Order & Deduct Stock
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
