'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { Order, OrderStatus } from '@/types';

export default function OrdersPage() {
  const { orders, customers, products, createOrder, updateOrderStatus, deleteOrder } = useElectroHub();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Create Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Handle Open Create Order
  const handleOpenCreate = () => {
    if (customers.length === 0 || products.length === 0) {
      showToast.warning('Cannot Create Order', 'Please add at least one customer and one product first.');
      return;
    }
    setSelectedCustomerId(customers[0].customer_id);
    setShippingAddress(customers[0].address || 'Standard Delivery');
    setCartItems([{ productId: products[0].product_id, quantity: 1 }]);
    setIsCreateOpen(true);
  };

  const addCartRow = () => {
    if (products.length === 0) return;
    setCartItems([...cartItems, { productId: products[0].product_id, quantity: 1 }]);
  };

  const removeCartRow = (index: number) => {
    if (cartItems.length <= 1) return;
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  const updateCartItem = (index: number, productId: string, quantity: number) => {
    setCartItems(
      cartItems.map((item, idx) => (idx === index ? { productId, quantity: Math.max(1, quantity) } : item))
    );
  };

  // Compute live cart total
  const estimatedTotal = useMemo(() => {
    return cartItems.reduce((acc, row) => {
      const prod = products.find((p) => p.product_id === row.productId || p.id === row.productId);
      return acc + (prod ? prod.price * row.quantity : 0);
    }, 0);
  }, [cartItems, products]);

  // Submit Order Creation
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast.error('Customer Required', 'Please select a customer for this order.');
      return;
    }

    // Verify stock availability
    for (const item of cartItems) {
      const p = products.find((prod) => prod.product_id === item.productId || prod.id === item.productId);
      if (p && p.stock_quantity < item.quantity) {
        showToast.error(
          'Insufficient Inventory',
          `${p.product_name} only has ${p.stock_quantity} units available.`
        );
        return;
      }
    }

    const payloadItems = cartItems.map((c) => ({
      product_id: c.productId,
      quantity: c.quantity,
    }));

    const res = await createOrder({
      customer_id: selectedCustomerId,
      items: payloadItems,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
    });

    if (res.success) {
      showToast.success('Purchase Order Generated', 'Inventory deducted and invoice recorded.');
      setIsCreateOpen(false);
    } else {
      showToast.error('Order Creation Failed', res.error || 'Failed to create purchase order.');
    }
  };

  // Status Change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    const res = await updateOrderStatus(selectedOrder.id, newStatus);
    if (res.success) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      showToast.info('Status Updated', `Order ${selectedOrder.order_id} set to ${newStatus}.`);
    } else {
      showToast.error('Status Update Failed', res.error || 'Failed to update status.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    const res = await deleteOrder(selectedOrder.id);
    if (res.success) {
      showToast.success('Order Deleted', `Order ${selectedOrder.order_id} removed.`);
      setIsDeleteOpen(false);
    } else {
      showToast.error('Delete Failed', res.error || 'Failed to delete order.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Purchase Orders & Fulfillment</h2>
            <p className="text-xs text-slate-400 mt-1">
              Process electronics procurement orders, invoice calculations, and dispatch workflows.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Order</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (ORD-501) or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full sm:w-40"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No orders found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders match your filter criteria or no orders have been recorded yet.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Create Your First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-4">Order ID</th>
                    <th className="py-3.5">Customer</th>
                    <th className="py-3.5">Items Count</th>
                    <th className="py-3.5">Order Total</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5">Date</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-4 font-mono font-bold text-blue-400">
                        {order.order_id}
                      </td>
                      <td className="py-3.5 font-medium text-white max-w-[200px]">
                        <div className="truncate">{order.customer_name || order.customer_id}</div>
                        <div className="text-[10px] text-slate-400">{order.customer_id}</div>
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">
                        {order.items ? order.items.length : 1} product(s)
                      </td>
                      <td className="py-3.5 font-mono text-emerald-400 font-bold text-sm">
                        ${order.order_total.toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <Badge
                          size="sm"
                          variant={
                            order.status === 'Completed'
                              ? 'success'
                              : order.status === 'Processing'
                              ? 'info'
                              : order.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(order.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE ORDER */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Electronics Purchase Order"
        subtitle="Deducts component inventory in real-time"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const cust = customers.find((c) => c.customer_id === e.target.value);
                  if (cust?.address) setShippingAddress(cust.address);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.customer_id}>
                    {c.first_name} {c.last_name} ({c.company || c.customer_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              >
                <option value="Corporate Card">Corporate Card</option>
                <option value="Bank Wire">Bank Wire Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net-30 Invoice">Net-30 Commercial Terms</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Delivery Address</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Facility address or shipping bay..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Ordered Components</label>
              <button
                type="button"
                onClick={addCartRow}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> Add Another Product
              </button>
            </div>

            {cartItems.map((row, idx) => {
              const prod = products.find((p) => p.product_id === row.productId);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-850"
                >
                  <select
                    value={row.productId}
                    onChange={(e) => updateCartItem(idx, e.target.value, row.quantity)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.product_id} disabled={p.stock_quantity === 0}>
                        {p.product_name} (${p.price.toFixed(2)}) &bull; {p.stock_quantity} left
                      </option>
                    ))}
                  </select>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateCartItem(idx, row.productId, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs text-center font-bold"
                    />
                  </div>

                  <span className="w-20 text-right font-mono font-bold text-white text-xs">
                    ${prod ? (prod.price * row.quantity).toFixed(2) : '0.00'}
                  </span>

                  {cartItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCartRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subtotal preview */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Order Subtotal (USD):</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Submit Order & Deduct Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW ORDER DETAILS / INVOICE */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Electronic Order Invoice"
        subtitle={selectedOrder ? `Invoice #${selectedOrder.order_id}` : ''}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="mt-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Order Total:</span>
                <span className="text-emerald-400 font-mono font-bold text-lg">
                  ${selectedOrder.order_total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Customer:</span>
                <span className="text-white font-semibold">{selectedOrder.customer_name}</span>
                <span className="text-slate-400 block text-[10px]">{selectedOrder.customer_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method:</span>
                <span className="text-slate-200">{selectedOrder.payment_method || 'Corporate Card'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Shipping Destination:</span>
                <span className="text-slate-300">{selectedOrder.shipping_address || 'Facility Delivery'}</span>
              </div>
            </div>

            {/* Line items list */}
            <div>
              <span className="text-slate-400 font-semibold block mb-2">Item Breakdown:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} x ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-200">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Order Cancellation & Delete"
        subtitle="This will permanently delete the purchase record"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete order <strong>{selectedOrder?.order_id}</strong> for{' '}
            <strong>${selectedOrder?.order_total.toFixed(2)}</strong>?
          </p>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Delete Order
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
