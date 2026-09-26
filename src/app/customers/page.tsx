'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ShoppingBag,
  Mail,
  Phone,
  Building,
  MapPin,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = useElectroHub();

  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formFirst, setFormFirst] = useState('');
  const [formLast, setFormLast] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.customer_id.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
      );
    });
  }, [customers, searchTerm]);

  // Orders for the currently selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) => o.customer_id === selectedCustomer.customer_id || o.customer_id === selectedCustomer.id
    );
  }, [orders, selectedCustomer]);

  const handleOpenAdd = () => {
    setFormId(`CUST-${Math.floor(100 + Math.random() * 900)}`);
    setFormFirst('');
    setFormLast('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormAddress('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setFormId(c.customer_id);
    setFormFirst(c.first_name);
    setFormLast(c.last_name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormCompany(c.company || '');
    setFormAddress(c.address || '');
    setIsEditOpen(true);
  };

  const handleOpenView = (c: Customer) => {
    setSelectedCustomer(c);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (c: Customer) => {
    setSelectedCustomer(c);
    setIsDeleteOpen(true);
  };

  // Submit Add
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formFirst || !formLast || !formEmail) {
      showToast.error('Validation Error', 'Please fill in Customer ID, Name, and Email.');
      return;
    }

    const res = await addCustomer({
      customer_id: formId.trim().toUpperCase(),
      first_name: formFirst.trim(),
      last_name: formLast.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '+1 (555) 000-0000',
      company: formCompany.trim() || undefined,
      address: formAddress.trim() || undefined,
    });

    if (res.success) {
      showToast.success('Customer Registered', `${formFirst} ${formLast} added to directory.`);
      setIsAddOpen(false);
    } else {
      showToast.error('Registration Failed', res.error || 'Failed to add customer.');
    }
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const res = await updateCustomer(selectedCustomer.id, {
      customer_id: formId.trim().toUpperCase(),
      first_name: formFirst.trim(),
      last_name: formLast.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      company: formCompany.trim() || undefined,
      address: formAddress.trim() || undefined,
    });

    if (res.success) {
      showToast.success('Customer Profile Updated', `${formFirst} ${formLast} saved.`);
      setIsEditOpen(false);
    } else {
      showToast.error('Update Failed', res.error || 'Failed to update customer.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    const res = await deleteCustomer(selectedCustomer.id);
    if (res.success) {
      showToast.success('Customer Deleted', `${selectedCustomer.first_name} ${selectedCustomer.last_name} removed.`);
      setIsDeleteOpen(false);
    } else {
      showToast.error('Delete Failed', res.error || 'Failed to delete customer.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Customer Accounts & CRM</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage robotics labs, electronics universities, aerospace clients, and commercial buyers.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, company, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Customers Table / Cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No customers found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No customer accounts match your search or no clients have been registered yet.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Add Your First Customer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-4">Customer ID</th>
                    <th className="py-3.5">Full Name</th>
                    <th className="py-3.5">Company / Lab</th>
                    <th className="py-3.5">Contact Email</th>
                    <th className="py-3.5">Phone</th>
                    <th className="py-3.5">Total Orders</th>
                    <th className="py-3.5">Lifetime Spend</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-4 font-mono font-bold text-emerald-400">
                        {cust.customer_id}
                      </td>
                      <td className="py-3.5 font-semibold text-white">
                        {cust.first_name} {cust.last_name}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {cust.company ? (
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-500" />
                            {cust.company}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Individual Buyer</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono">{cust.email}</td>
                      <td className="py-3.5 text-slate-400">{cust.phone}</td>
                      <td className="py-3.5 font-bold text-slate-200">
                        {cust.orders_count} orders
                      </td>
                      <td className="py-3.5 font-mono text-emerald-400 font-bold">
                        ${cust.total_spent.toFixed(2)}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Profile & Orders"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Customer"
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

      {/* MODAL: ADD CUSTOMER */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer"
        subtitle="Registers client in the PostgreSQL customers registry"
      >
        <form onSubmit={handleSaveNew} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer ID *</label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="CUST-105"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Organization</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="MIT Robotics Lab"
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
                value={formFirst}
                onChange={(e) => setFormFirst(e.target.value)}
                placeholder="Elena"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formLast}
                onChange={(e) => setFormLast(e.target.value)}
                placeholder="Vance"
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
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="elena@lab.tech"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 (555) 234-8901"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Billing & Delivery Address</label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="104 Innovation Way, Austin, TX"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT CUSTOMER */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Customer Profile"
        subtitle={`Updating account: ${selectedCustomer?.customer_id}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer ID *</label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Organization</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
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
                value={formFirst}
                onChange={(e) => setFormFirst(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formLast}
                onChange={(e) => setFormLast(e.target.value)}
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
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Address</label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
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
              Update Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW CUSTOMER & ORDER HISTORY */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Customer Dossier & History"
        subtitle={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : ''}
        maxWidth="xl"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-500 block">Customer ID:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  {selectedCustomer.customer_id}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Affiliation / Lab:</span>
                <span className="text-white font-medium">
                  {selectedCustomer.company || 'Private Commercial'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address:</span>
                <span className="text-slate-300 font-mono">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <span className="text-slate-300">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lifetime Orders:</span>
                <span className="text-white font-bold">{selectedCustomer.orders_count}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cumulative Spend:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ${selectedCustomer.total_spent.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Customer Order History */}
            <div>
              <h5 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>Customer Order History ({customerOrders.length})</span>
              </h5>

              {customerOrders.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500">
                  No orders recorded for this customer yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{ord.order_id}</span>
                          <Badge
                            size="sm"
                            variant={
                              ord.status === 'Completed'
                                ? 'success'
                                : ord.status === 'Processing'
                                ? 'info'
                                : 'warning'
                            }
                          >
                            {ord.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(ord.created_at).toLocaleDateString()} &bull; {ord.payment_method}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ${ord.order_total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Customer Account Removal"
        subtitle="Caution: Irreversible database action"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete customer{' '}
            <strong>
              {selectedCustomer?.first_name} {selectedCustomer?.last_name}
            </strong>{' '}
            ({selectedCustomer?.customer_id})?
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
              Delete Customer
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
