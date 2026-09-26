'use client';

import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  Eye,
  AlertTriangle,
  History,
  FileText,
  Boxes,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { DiscontinuedProduct } from '@/types';

export default function DiscontinuedProductsPage() {
  const {
    discontinuedProducts,
    reactivateDiscontinuedProduct,
    deleteDiscontinuedProduct,
  } = useElectroHub();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DiscontinuedProduct | null>(null);

  const categories = useMemo(() => {
    const set = new Set(discontinuedProducts.map((p) => p.category));
    return Array.from(set);
  }, [discontinuedProducts]);

  const filteredItems = useMemo(() => {
    return discontinuedProducts.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.product_name.toLowerCase().includes(q) ||
        p.product_id.toLowerCase().includes(q) ||
        p.reason.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [discontinuedProducts, searchTerm, selectedCategory]);

  const handleOpenView = (p: DiscontinuedProduct) => {
    setSelectedItem(p);
    setIsViewOpen(true);
  };

  const handleOpenRestore = (p: DiscontinuedProduct) => {
    setSelectedItem(p);
    setIsRestoreOpen(true);
  };

  const handleOpenDelete = (p: DiscontinuedProduct) => {
    setSelectedItem(p);
    setIsDeleteOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedItem) return;
    await reactivateDiscontinuedProduct(selectedItem.id);
    showToast.success('Component Reactivated', `${selectedItem.product_name} restored to active inventory.`);
    setIsRestoreOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    await deleteDiscontinuedProduct(selectedItem.id);
    showToast.success('Archive Record Purged', `${selectedItem.product_name} deleted.`);
    setIsDeleteOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Archive Aesthetics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Discontinued Products Registry</h2>
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-medium">
                Archived Silicon & Components
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical ledger of end-of-life (EOL), obsolete, or RoHS-restricted electronic parts.
            </p>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <History className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <p className="font-semibold text-white">Discontinued Items Operational Rule</p>
            <p className="mt-0.5">
              These products cannot be added to customer orders unless explicitly restored to the active catalog using the Reactivate action.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search discontinued components or reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full sm:w-48"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Discontinued Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Archive className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No discontinued items found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No archived or retired components match your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-4">Product ID</th>
                    <th className="py-3.5">Component Name</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5">Previous Unit Price</th>
                    <th className="py-3.5">Obsolescence Reason</th>
                    <th className="py-3.5">Date Discontinued</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors opacity-90 hover:opacity-100"
                    >
                      <td className="py-3.5 pl-4 font-mono font-bold text-amber-400">
                        {item.product_id}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-200 max-w-[220px] truncate line-through decoration-slate-600">
                        {item.product_name}
                      </td>
                      <td className="py-3.5 text-slate-400">{item.category}</td>
                      <td className="py-3.5 font-mono text-slate-400">
                        ${item.previous_price.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-slate-300 max-w-[280px]">
                        <span className="line-clamp-2 italic text-[11px]">&quot;{item.reason}&quot;</span>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(item.discontinued_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View EOL Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenRestore(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Reactivate to Active Inventory"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Purge Record"
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

      {/* MODAL: VIEW DETAILS */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Discontinued Component Dossier"
        subtitle={selectedItem ? `${selectedItem.product_name} (${selectedItem.product_id})` : ''}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Product ID:</span>
                <span className="font-mono font-bold text-amber-400">{selectedItem.product_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-white">{selectedItem.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Active Price:</span>
                <span className="text-slate-300 font-mono">${selectedItem.previous_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discontinuation Date:</span>
                <span className="text-slate-300">
                  {new Date(selectedItem.discontinued_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Documented Reason:</span>
              <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed italic">
                &quot;{selectedItem.reason}&quot;
              </p>
            </div>

            {selectedItem.notes && (
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Archived Engineering Notes:</span>
                <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed">
                  {selectedItem.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Archive Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: REACTIVATE CONFIRMATION */}
      <Modal
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        title="Reactivate Component into Inventory"
        subtitle="Restores item to active product catalog"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Reactivating <strong>{selectedItem?.product_name}</strong> will return it to the active product catalog with an initial buffer of 10 stock units. It will immediately become orderable again.
          </p>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              onClick={() => setIsRestoreOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRestore}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Confirm Reactivation
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Purge Discontinued Record"
        subtitle="Permanent ledger removal"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Permanently erase <strong>{selectedItem?.product_name}</strong> from archived records?
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
              Purge Permanently
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
