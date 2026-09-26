'use client';

import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Search,
  PackagePlus,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { Product } from '@/types';

export default function InventoryPage() {
  const { products, updateProduct, adjustProductStock } = useElectroHub();

  const [activeTab, setActiveTab] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Stock Adjust Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('10');
  const [adjustmentType, setAdjustmentType] = useState<'RECEIVE' | 'DISPATCH'>('RECEIVE');

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + p.stock_quantity, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock_quantity * p.price, 0);

  const lowStockList = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold
  );
  const outOfStockList = products.filter((p) => p.stock_quantity === 0);
  const inStockList = products.filter((p) => p.stock_quantity > p.min_stock_threshold);

  const filteredItems = products
    .filter((p) => {
      if (activeTab === 'LOW') return p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_threshold;
      if (activeTab === 'OUT') return p.stock_quantity === 0;
      return true;
    })
    .filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleOpenAdjust = (p: Product, defaultType: 'RECEIVE' | 'DISPATCH' = 'RECEIVE') => {
    setSelectedProduct(p);
    setAdjustmentType(defaultType);
    setAdjustmentAmount('10');
    setIsAdjustOpen(true);
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = parseInt(adjustmentAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Invalid Quantity', 'Please enter a positive integer.');
      return;
    }

    const delta = adjustmentType === 'RECEIVE' ? amount : -amount;
    if (adjustmentType === 'DISPATCH' && selectedProduct.stock_quantity < amount) {
      showToast.error('Insufficient Stock', `Cannot dispatch more than current stock (${selectedProduct.stock_quantity}).`);
      return;
    }

    const res = await adjustProductStock(selectedProduct.id, delta);
    if (res.success) {
      showToast.success(
        adjustmentType === 'RECEIVE' ? 'Inventory Received' : 'Inventory Dispatched',
        `${selectedProduct.product_name} adjusted by ${delta > 0 ? `+${delta}` : delta} units.`
      );
      setIsAdjustOpen(false);
    } else {
      showToast.error('Inventory Error', res.error || 'Failed to adjust stock.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Inventory Control & Warehouse</h2>
            <p className="text-xs text-slate-400 mt-1">
              Active stock telemetry, automated buffer triggers, and inbound intake workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (products[0]) handleOpenAdjust(products[0], 'RECEIVE');
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Intake Stock Shipment</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Inventory Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Warehouse Units</p>
            <p className="text-2xl font-bold text-white mt-1">{totalUnits.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across {products.length} catalog items</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inventory Valuation</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-slate-400 mt-1">At active wholesale cost</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Low Stock Warnings</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{lowStockList.length} Items</p>
            <p className="text-[11px] text-amber-400/80 mt-1">Below minimum threshold</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs font-medium text-rose-400 uppercase tracking-wider">Out of Stock (Zero)</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{outOfStockList.length} Items</p>
            <p className="text-[11px] text-rose-400/80 mt-1">Immediate PO replenishment needed</p>
          </div>
        </div>

        {/* Critical Alerts Banner if out of stock exists */}
        {outOfStockList.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-white text-sm">Critical Inventory Depletion Alert</p>
              <p className="text-rose-200 mt-0.5">
                The following {outOfStockList.length} component(s) are at zero units:
                <span className="font-semibold ml-1">
                  {outOfStockList.map((p) => p.product_name).join(', ')}.
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('OUT')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              Filter Out of Stock
            </button>
          </div>
        )}

        {/* Navigation Tabs and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('LOW')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'LOW'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Low Stock Alert ({lowStockList.length})
            </button>
            <button
              onClick={() => setActiveTab('OUT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'OUT'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Out of Stock ({outOfStockList.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components in inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Inventory Control Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Boxes className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-white">No items found in this inventory view</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-4">Component & ID</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">Stock Level vs Threshold</th>
                    <th className="py-3.5">Unit Price</th>
                    <th className="py-3.5">Asset Value</th>
                    <th className="py-3.5">Condition</th>
                    <th className="py-3.5 pr-4 text-right">Quick Stock Intake</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredItems.map((p) => {
                    const thresholdPct = Math.min(
                      100,
                      Math.round((p.stock_quantity / Math.max(p.min_stock_threshold * 2, 1)) * 100)
                    );

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-4">
                          <p className="font-semibold text-white max-w-[220px] truncate">{p.product_name}</p>
                          <p className="text-[10px] text-blue-400 font-mono">{p.product_id}</p>
                        </td>
                        <td className="py-3.5 text-slate-300">{p.category}</td>
                        <td className="py-3.5 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-white">{p.stock_quantity} units</span>
                            <span className="text-slate-400">Min: {p.min_stock_threshold}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                p.status === 'OUT OF STOCK'
                                  ? 'bg-rose-500'
                                  : p.status === 'LOW STOCK'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${Math.max(thresholdPct, 4)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-300 font-mono">${p.price.toFixed(2)}</td>
                        <td className="py-3.5 font-bold text-white font-mono">
                          ${(p.price * p.stock_quantity).toFixed(2)}
                        </td>
                        <td className="py-3.5">
                          <Badge
                            size="sm"
                            variant={
                              p.status === 'IN STOCK'
                                ? 'success'
                                : p.status === 'LOW STOCK'
                                ? 'warning'
                                : 'danger'
                            }
                            pulse={p.status === 'OUT OF STOCK'}
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await adjustProductStock(p.id, 5);
                                if (res.success) showToast.success('Stock Adjusted', `Added +5 units to ${p.product_name}.`);
                                else showToast.error('Stock Error', res.error || 'Failed to adjust stock.');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                              title="Quick +5 units"
                            >
                              +5
                            </button>
                            <button
                              onClick={async () => {
                                const res = await adjustProductStock(p.id, 25);
                                if (res.success) showToast.success('Stock Adjusted', `Added +25 units to ${p.product_name}.`);
                                else showToast.error('Stock Error', res.error || 'Failed to adjust stock.');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                              title="Quick +25 units"
                            >
                              +25
                            </button>
                            <button
                              onClick={() => handleOpenAdjust(p)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-[11px] font-semibold transition-all"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: STOCK ADJUSTMENT */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Stock Adjustment & Shipment Inflow"
        subtitle={selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_id})` : ''}
      >
        <form onSubmit={handleApplyAdjustment} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Current Stock:</span>
              <span className="text-white font-bold text-sm">
                {selectedProduct?.stock_quantity} units
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Safety Minimum:</span>
              <span className="text-amber-400 font-bold text-sm">
                {selectedProduct?.min_stock_threshold} units
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Operation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('RECEIVE')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  adjustmentType === 'RECEIVE'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Inbound Shipment (+ Receive)
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('DISPATCH')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  adjustmentType === 'DISPATCH'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Outbound Dispatch (- Deduct)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Unit Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdjustOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Apply Inventory Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
