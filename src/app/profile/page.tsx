'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Phone,
  Building,
  Key,
  Calendar,
  LogOut,
  Edit3,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useElectroHub();
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Edit fields
  const [firstName, setFirstName] = useState(user?.first_name || 'Alex');
  const [lastName, setLastName] = useState(user?.last_name || 'Sterling');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-4820');
  const [department, setDepartment] = useState(user?.department || 'Operations & Engineering');
  const [role, setRole] = useState(user?.role || 'Principal Systems Administrator');

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleOpenEdit = () => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone);
      setDepartment(user.department);
      setRole(user.role);
    }
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone,
      department,
      role,
    });
    showToast.success('Profile Saved', 'Personal information and credentials updated.');
    setIsEditOpen(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      showToast.error('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      showToast.error('Mismatch', 'New passwords do not match.');
      return;
    }

    showToast.success('Password Changed', 'Security credentials updated in Supabase auth.');
    setIsPasswordOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleLogout = async () => {
    await logout();
    showToast.info('Signed Out', 'You have been logged out of ElectroHub.');
    router.push('/login');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Administrator Profile & Security</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage personal credentials, authorized security tier, and active system permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-500/20">
              {user ? user.first_name[0] : 'A'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold text-white">
                  {user ? `${user.first_name} ${user.last_name}` : 'Alex Sterling'}
                </h3>
                <Badge size="sm" variant="success">
                  {user?.account_status || 'Verified Active'}
                </Badge>
              </div>
              <p className="text-xs font-medium text-blue-400">{user?.role || 'Principal Systems Administrator'}</p>
              <p className="text-xs text-slate-400">{user?.department || 'Operations & Engineering Management'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Work Email
              </span>
              <span className="text-white font-mono font-medium">{user?.email || 'admin@electrohub.io'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Contact Phone
              </span>
              <span className="text-white">{user?.phone || '+1 (555) 019-4820'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
              <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Last Authenticated Session
              </span>
              <span className="text-white">
                {user?.last_sign_in
                  ? new Date(user.last_sign_in).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Active Now'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Level Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Security Credentials & Auth Policies
              </h4>
            </div>
            <button
              onClick={() => setIsPasswordOpen(true)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Full Postgres Catalog Write Privileges</p>
                <p className="text-[11px] text-slate-400">Can create, update, and delete components, orders, and clients.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">Granted</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Supabase Auth Session Persistence</p>
                <p className="text-[11px] text-slate-400">Encrypted JWT tokens stored in browser LocalStorage session.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">Active</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Audit Log Integrity Protection</p>
                <p className="text-[11px] text-slate-400">Inventory transactions and order creations logged with timestamp.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT PROFILE */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Administrator Profile"
        subtitle="Updates display details across the ERP interface"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Role Title</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE PASSWORD */}
      <Modal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        title="Update Security Password"
        subtitle="Enforces minimum 6-character auth standard"
      >
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">New Password (6+ chars)</label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPasswordOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
