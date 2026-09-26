'use client';

import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Archive,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { Product, ProductCategory, ProductStatus } from '@/types';

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

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, discontinueProduct } = useElectroHub();

  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'product_name' | 'price' | 'stock_quantity' | 'product_id'>('product_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDiscontinueOpen, setIsDiscontinueOpen] = useState(false);

  // Selected Item for Actions
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState('');

  // Form State (Add / Edit)
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Microcontrollers & ICs');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formThreshold, setFormThreshold] = useState('10');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setFormId(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory('Microcontrollers & ICs');
    setFormPrice('');
    setFormStock('25');
    setFormThreshold('10');
    setFormDescription('');
    setFormSku('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setFormId(p.product_id);
    setFormName(p.product_name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormStock(p.stock_quantity.toString());
    setFormThreshold(p.min_stock_threshold.toString());
    setFormDescription(p.description || '');
    setFormSku(p.sku || '');
    setIsEditOpen(true);
  };

  const handleOpenView = (p: Product) => {
    setSelectedProduct(p);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (p: Product) => {
    setSelectedProduct(p);
    setIsDeleteOpen(true);
  };

  const handleOpenDiscontinue = (p: Product) => {
    setSelectedProduct(p);
    setDiscontinueReason('Superseded by newer silicon revision');
    setIsDiscontinueOpen(true);
  };

  // Submit Add
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName || !formPrice) {
      showToast.error('Validation Error', 'Please complete all required product fields.');
      return;
    }

    const price = parseFloat(formPrice);
    const stock = parseInt(formStock, 10) || 0;
    const threshold = parseInt(formThreshold, 10) || 10;

    await addProduct({
      product_id: formId.trim().toUpperCase(),
      product_name: formName.trim(),
      category: formCategory,
      price,
      stock_quantity: stock,
      min_stock_threshold: threshold,
      description: formDescription,
      sku: formSku || `SKU-${formId}`,
      status: stock === 0 ? 'OUT OF STOCK' : stock <= threshold ? 'LOW STOCK' : 'IN STOCK',
    });

    showToast.success('Product Added', `${formName} added to catalog.`);
    setIsAddOpen(false);
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const price = parseFloat(formPrice);
    const stock = parseInt(formStock, 10) || 0;
    const threshold = parseInt(formThreshold, 10) || 10;

    await updateProduct(selectedProduct.id, {
      product_id: formId.trim().toUpperCase(),
      product_name: formName.trim(),
      category: formCategory,
      price,
      stock_quantity: stock,
      min_stock_threshold: threshold,
      description: formDescription,
      sku: formSku,
    });

    showToast.success('Product Updated', `${formName} catalog details revised.`);
    setIsEditOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.id);
    showToast.success('Product Removed', `${selectedProduct.product_name} deleted from database.`);
    setIsDeleteOpen(false);
  };

  // Confirm Discontinue
  const handleConfirmDiscontinue = async () => {
    if (!selectedProduct) return;
    await discontinueProduct(selectedProduct.id, discontinueReason);
    showToast.warning('Product Discontinued', `${selectedProduct.product_name} moved to Discontinued Registry.`);
    setIsDiscontinueOpen(false);
  };

  const exportCSV = () => {
    const headers = 'Product ID,Name,Category,Price,Stock,Threshold,Status\n';
    const rows = products
      .map(
        (p) =>
          `"${p.product_id}","${p.product_name.replace(/"/g, '""')}","${p.category}",${p.price},${p.stock_quantity},${p.min_stock_threshold},"${p.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrohub_products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast.info('CSV Exported', 'Inventory catalog exported as CSV.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Electronic Products Catalog</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage ICs, hardware boards, sensors, modules, and laboratory equipment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, ID, or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full md:w-48"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 w-full md:w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN STOCK">IN STOCK</option>
              <option value="LOW STOCK">LOW STOCK</option>
              <option value="OUT OF STOCK">OUT OF STOCK</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-colors"
              title={`Sort order: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {paginatedProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Boxes className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No products found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No electronic components match your search and filter criteria.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th
                      className="py-3.5 pl-4 cursor-pointer hover:text-white"
                      onClick={() => setSortField('product_id')}
                    >
                      Product ID
                    </th>
                    <th
                      className="py-3.5 cursor-pointer hover:text-white"
                      onClick={() => setSortField('product_name')}
                    >
                      Product Name
                    </th>
                    <th className="py-3.5">Category</th>
                    <th
                      className="py-3.5 cursor-pointer hover:text-white"
                      onClick={() => setSortField('price')}
                    >
                      Price
                    </th>
                    <th
                      className="py-3.5 cursor-pointer hover:text-white"
                      onClick={() => setSortField('stock_quantity')}
                    >
                      Stock
                    </th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3.5 pl-4 font-mono font-semibold text-blue-400">
                        {product.product_id}
                      </td>
                      <td className="py-3.5 font-medium text-white max-w-[260px]">
                        <div className="truncate font-semibold">{product.product_name}</div>
                        {product.sku && <div className="text-[10px] text-slate-500 font-mono">{product.sku}</div>}
                      </td>
                      <td className="py-3.5 text-slate-300">{product.category}</td>
                      <td className="py-3.5 font-mono text-slate-200 font-bold">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-200">
                        {product.stock_quantity} units
                      </td>
                      <td className="py-3.5">
                        <Badge
                          size="sm"
                          variant={
                            product.status === 'IN STOCK'
                              ? 'success'
                              : product.status === 'LOW STOCK'
                              ? 'warning'
                              : 'danger'
                          }
                          pulse={product.status === 'OUT OF STOCK'}
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDiscontinue(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Discontinue Product"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Product"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
                >
                  Previous
                </button>
                <span className="px-2 text-white font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD PRODUCT */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Electronics Component"
        subtitle="Registers an item in the PostgreSQL catalog"
      >
        <form onSubmit={handleSaveNew} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Product ID *</label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
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
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
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
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. ESP32-WROOM Microcontroller"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">SKU Code</label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="MCU-ESP32-WRM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Stock Units</label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reorder Threshold</label>
              <input
                type="number"
                value={formThreshold}
                onChange={(e) => setFormThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description & Specs</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Technical specs, operating voltage, pinouts..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
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

      {/* MODAL: EDIT PRODUCT */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Electronics Component"
        subtitle={`Updating SKU: ${selectedProduct?.product_id}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Product ID *</label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">SKU Code</label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Current Stock</label>
              <input
                type="number"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reorder Threshold</label>
              <input
                type="number"
                value={formThreshold}
                onChange={(e) => setFormThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description & Specs</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Update Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW DETAILS */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Component Specifications"
        subtitle={selectedProduct ? selectedProduct.product_name : ''}
      >
        {selectedProduct && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Product ID:</span>
                <span className="text-blue-400 font-mono font-bold text-sm">
                  {selectedProduct.product_id}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">SKU:</span>
                <span className="text-slate-200 font-mono">{selectedProduct.sku || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="text-white font-medium">{selectedProduct.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Unit Price:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ${selectedProduct.price.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Stock:</span>
                <span className="text-white font-bold">{selectedProduct.stock_quantity} units</span>
              </div>
              <div>
                <span className="text-slate-500 block">Min Threshold:</span>
                <span className="text-amber-400 font-bold">
                  {selectedProduct.min_stock_threshold} units
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Operational Description:</span>
              <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {selectedProduct.description || 'No engineering notes provided for this component.'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DISCONTINUE PRODUCT */}
      <Modal
        isOpen={isDiscontinueOpen}
        onClose={() => setIsDiscontinueOpen(false)}
        title="Discontinue Electronic Component"
        subtitle={`Retire ${selectedProduct?.product_id} from active catalog`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Discontinuing will archive <strong>{selectedProduct?.product_name}</strong> and move it
            to the Discontinued Registry. Customers will no longer be able to place new purchase orders
            for this item.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Obsolescence Reason *
            </label>
            <textarea
              rows={3}
              value={discontinueReason}
              onChange={(e) => setDiscontinueReason(e.target.value)}
              placeholder="e.g. End of Life (EOL), manufacturer fab shutdown, RoHS restriction..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              onClick={() => setIsDiscontinueOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDiscontinue}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
            >
              Confirm Discontinuation
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CONFIRM DELETE */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Permanent Deletion"
        subtitle="Caution: Irreversible database action"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <p className="font-semibold text-white">Permanent Removal</p>
              <p className="mt-0.5">
                Are you sure you want to delete <strong>{selectedProduct?.product_name}</strong> (
                {selectedProduct?.product_id})? All inventory counters and historical records will be deleted.
              </p>
            </div>
          </div>

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
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
