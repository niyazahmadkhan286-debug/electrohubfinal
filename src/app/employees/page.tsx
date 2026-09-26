'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  Shield,
  DollarSign,
  Calendar,
  Building,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useElectroHub } from '@/lib/store';
import { showToast } from '@/components/ui/Toast';
import { FullTimeEmployee, PartTimeEmployee, Contractor } from '@/types';

export default function EmployeesPage() {
  const {
    fullTimeEmployees,
    partTimeEmployees,
    contractors,
    addFullTimeEmployee,
    updateFullTimeEmployee,
    deleteFullTimeEmployee,
    addPartTimeEmployee,
    updatePartTimeEmployee,
    deletePartTimeEmployee,
    addContractor,
    updateContractor,
    deleteContractor,
  } = useElectroHub();

  const [activeTab, setActiveTab] = useState<'ALL' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Target item
  const [selectedType, setSelectedType] = useState<'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR'>('FULL_TIME');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Form Fields
  const [addType, setAddType] = useState<'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR'>('FULL_TIME');
  const [formId, setFormId] = useState('');
  const [formFirst, setFormFirst] = useState('');
  const [formLast, setFormLast] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDeptId, setFormDeptId] = useState('DEPT-ENG');
  const [formDeptName, setFormDeptName] = useState('Hardware Engineering');
  const [formRole, setFormRole] = useState('Embedded Systems Engineer');

  // Full-time specific
  const [formSalary, setFormSalary] = useState('115000');
  const [formBenefits, setFormBenefits] = useState(true);
  const [formLeaveDays, setFormLeaveDays] = useState('25');

  // Part-time specific
  const [formHourly, setFormHourly] = useState('35');
  const [formWeeklyHours, setFormWeeklyHours] = useState('20');
  const [formSchedule, setFormSchedule] = useState('Morning / Lab Testing Shift');

  // Contractor specific
  const [formAgency, setFormAgency] = useState('Apex Embedded Consulting');
  const [formContractRate, setFormContractRate] = useState('90');
  const [formProject, setFormProject] = useState('High-Speed Circuit Verification');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');

  // Unified list for All Employees tab
  const allList = useMemo(() => {
    return [
      ...fullTimeEmployees.map((e) => ({ ...e, recordCategory: 'FULL_TIME' })),
      ...partTimeEmployees.map((e) => ({ ...e, recordCategory: 'PART_TIME' })),
      ...contractors.map((c) => ({
        ...c,
        recordCategory: 'CONTRACTOR',
        emp_id: c.contractor_id,
        department_name: c.agency_or_company,
        role: `Contractor: ${c.project_assigned}`,
      })),
    ];
  }, [fullTimeEmployees, partTimeEmployees, contractors]);

  // Filtered List based on active tab and search
  const filteredList = useMemo(() => {
    let base = allList;
    if (activeTab !== 'ALL') {
      base = allList.filter((item) => item.recordCategory === activeTab);
    }
    const q = searchTerm.toLowerCase();
    return base.filter((item) => {
      const name = `${item.first_name} ${item.last_name}`.toLowerCase();
      const id = (item.emp_id || '').toLowerCase();
      const dept = (item.department_name || '').toLowerCase();
      const role = (item.role || '').toLowerCase();
      return name.includes(q) || id.includes(q) || dept.includes(q) || role.includes(q);
    });
  }, [allList, activeTab, searchTerm]);

  const handleOpenAdd = () => {
    const rand = Math.floor(200 + Math.random() * 800);
    if (addType === 'CONTRACTOR') {
      setFormId(`CNT-${rand}`);
    } else {
      setFormId(`EMP-${rand}`);
    }
    setFormFirst('');
    setFormLast('');
    setFormEmail('');
    setFormPhone('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedRecord(item);
    setSelectedType(item.recordCategory);
    setFormFirst(item.first_name);
    setFormLast(item.last_name);
    setFormEmail(item.email);
    setFormPhone(item.phone || '');

    if (item.recordCategory === 'FULL_TIME') {
      setFormId(item.emp_id);
      setFormDeptId(item.department_id);
      setFormDeptName(item.department_name);
      setFormRole(item.role);
      setFormSalary(item.annual_salary?.toString() || '100000');
      setFormBenefits(item.health_benefits ?? true);
      setFormLeaveDays(item.paid_leave_days?.toString() || '25');
    } else if (item.recordCategory === 'PART_TIME') {
      setFormId(item.emp_id);
      setFormDeptId(item.department_id);
      setFormDeptName(item.department_name);
      setFormRole(item.role);
      setFormHourly(item.hourly_rate?.toString() || '30');
      setFormWeeklyHours(item.weekly_hours?.toString() || '20');
      setFormSchedule(item.schedule_type || 'Morning Shift');
    } else {
      setFormId(item.contractor_id || item.emp_id);
      setFormAgency(item.agency_or_company);
      setFormContractRate(item.contract_rate?.toString() || '80');
      setFormProject(item.project_assigned);
      setFormEndDate(item.contract_end_date);
    }
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setSelectedRecord(item);
    setSelectedType(item.recordCategory);
    setIsDeleteOpen(true);
  };

  // Save New Employee / Contractor
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formFirst || !formLast || !formEmail) {
      showToast.error('Validation Error', 'Please complete required fields.');
      return;
    }

    if (addType === 'FULL_TIME') {
      const res = await addFullTimeEmployee({
        emp_id: formId.trim().toUpperCase(),
        first_name: formFirst.trim(),
        last_name: formLast.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '+1 (555) 100-0000',
        department_id: formDeptId,
        department_name: formDeptName,
        role: formRole,
        annual_salary: parseFloat(formSalary) || 95000,
        health_benefits: formBenefits,
        paid_leave_days: parseInt(formLeaveDays, 10) || 25,
        status: 'Active',
      });
      if (!res.success) {
        showToast.error('Creation Failed', res.error || 'Failed to add full-time staff.');
        return;
      }
      showToast.success('Full-Time Staff Added', `${formFirst} ${formLast} added.`);
    } else if (addType === 'PART_TIME') {
      const res = await addPartTimeEmployee({
        emp_id: formId.trim().toUpperCase(),
        first_name: formFirst.trim(),
        last_name: formLast.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '+1 (555) 100-0000',
        department_id: formDeptId,
        department_name: formDeptName,
        role: formRole,
        hourly_rate: parseFloat(formHourly) || 30,
        weekly_hours: parseInt(formWeeklyHours, 10) || 20,
        schedule_type: formSchedule,
        status: 'Active',
      });
      if (!res.success) {
        showToast.error('Creation Failed', res.error || 'Failed to add part-time employee.');
        return;
      }
      showToast.success('Part-Time Employee Added', `${formFirst} ${formLast} added.`);
    } else {
      const res = await addContractor({
        contractor_id: formId.trim().toUpperCase(),
        first_name: formFirst.trim(),
        last_name: formLast.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '+1 (555) 100-0000',
        agency_or_company: formAgency,
        contract_rate: parseFloat(formContractRate) || 85,
        rate_type: 'hourly',
        project_assigned: formProject,
        contract_end_date: formEndDate,
      });
      if (!res.success) {
        showToast.error('Creation Failed', res.error || 'Failed to register contractor.');
        return;
      }
      showToast.success('Contractor Registered', `${formFirst} ${formLast} added.`);
    }

    setIsAddOpen(false);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    let res: { success: boolean; error?: string };
    if (selectedType === 'FULL_TIME') {
      res = await updateFullTimeEmployee(selectedRecord.id, {
        first_name: formFirst,
        last_name: formLast,
        email: formEmail,
        department_id: formDeptId,
        department_name: formDeptName,
        role: formRole,
        annual_salary: parseFloat(formSalary),
        health_benefits: formBenefits,
        paid_leave_days: parseInt(formLeaveDays, 10),
      });
    } else if (selectedType === 'PART_TIME') {
      res = await updatePartTimeEmployee(selectedRecord.id, {
        first_name: formFirst,
        last_name: formLast,
        email: formEmail,
        department_id: formDeptId,
        department_name: formDeptName,
        role: formRole,
        hourly_rate: parseFloat(formHourly),
        weekly_hours: parseInt(formWeeklyHours, 10),
        schedule_type: formSchedule,
      });
    } else {
      res = await updateContractor(selectedRecord.id, {
        first_name: formFirst,
        last_name: formLast,
        email: formEmail,
        agency_or_company: formAgency,
        contract_rate: parseFloat(formContractRate),
        project_assigned: formProject,
        contract_end_date: formEndDate,
      });
    }

    if (!res.success) {
      showToast.error('Update Failed', res.error || 'Could not update personnel record.');
      return;
    }

    showToast.success('Personnel Record Updated', `${formFirst} ${formLast} updated.`);
    setIsEditOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    let res: { success: boolean; error?: string };
    if (selectedType === 'FULL_TIME') {
      res = await deleteFullTimeEmployee(selectedRecord.id);
    } else if (selectedType === 'PART_TIME') {
      res = await deletePartTimeEmployee(selectedRecord.id);
    } else {
      res = await deleteContractor(selectedRecord.id);
    }

    if (!res.success) {
      showToast.error('Delete Failed', res.error || 'Could not remove record.');
      return;
    }

    showToast.success('Record Deleted', `${selectedRecord.first_name} ${selectedRecord.last_name} removed.`);
    setIsDeleteOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Workforce & Engineering Staff</h2>
            <p className="text-xs text-slate-400 mt-1">
              Personnel directory categorized by full-time staff, lab technicians, and specialized hardware contractors.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Personnel</span>
          </button>
        </div>

        {/* Tab Selection Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Personnel ({allList.length})
            </button>
            <button
              onClick={() => setActiveTab('FULL_TIME')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'FULL_TIME'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-indigo-400'
              }`}
            >
              Full-Time ({fullTimeEmployees.length})
            </button>
            <button
              onClick={() => setActiveTab('PART_TIME')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'PART_TIME'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              Part-Time ({partTimeEmployees.length})
            </button>
            <button
              onClick={() => setActiveTab('CONTRACTOR')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'CONTRACTOR'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Contractors ({contractors.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Personnel Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No personnel found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No team members match this view or no employees have been added yet.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Add First Team Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 pl-4">Personnel ID</th>
                    <th className="py-3.5">Name</th>
                    <th className="py-3.5">Classification</th>
                    <th className="py-3.5">Department / Organization</th>
                    <th className="py-3.5">Role / Project</th>
                    <th className="py-3.5">Compensation / Rate</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-4 font-mono font-bold text-blue-400">
                        {item.emp_id || item.contractor_id}
                      </td>
                      <td className="py-3.5 font-semibold text-white">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="py-3.5">
                        <Badge
                          size="sm"
                          variant={
                            item.recordCategory === 'FULL_TIME'
                              ? 'purple'
                              : item.recordCategory === 'PART_TIME'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {item.recordCategory.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {item.department_name || item.agency_or_company}
                      </td>
                      <td className="py-3.5 text-slate-400 font-medium">
                        {item.role || item.project_assigned}
                      </td>
                      <td className="py-3.5 font-mono text-emerald-400 font-bold">
                        {item.recordCategory === 'FULL_TIME' && `$${item.annual_salary?.toLocaleString()}/yr`}
                        {item.recordCategory === 'PART_TIME' && `$${item.hourly_rate}/hr (${item.weekly_hours}h/wk)`}
                        {item.recordCategory === 'CONTRACTOR' && `$${item.contract_rate}/hr (thru ${item.contract_end_date})`}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Record"
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

      {/* MODAL: ADD PERSONNEL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Personnel / Contractor"
        subtitle="Registers workforce profile in the database"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNew} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Employment Category</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddType('FULL_TIME');
                  setFormId(`EMP-${Math.floor(200 + Math.random() * 800)}`);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  addType === 'FULL_TIME'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Full-Time Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddType('PART_TIME');
                  setFormId(`EMP-${Math.floor(200 + Math.random() * 800)}`);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  addType === 'PART_TIME'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Part-Time Lab
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddType('CONTRACTOR');
                  setFormId(`CNT-${Math.floor(300 + Math.random() * 700)}`);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  addType === 'CONTRACTOR'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Contractor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {addType === 'CONTRACTOR' ? 'Contractor ID *' : 'Employee ID *'}
              </label>
              <input
                type="text"
                required
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email *</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="staff@electrohub.internal"
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
                placeholder="Marcus"
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
                placeholder="Brody"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Conditional Fields: Full-Time / Part-Time / Contractor */}
          {addType === 'FULL_TIME' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Department Name</label>
                <input
                  type="text"
                  value={formDeptName}
                  onChange={(e) => setFormDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Annual Salary ($)</label>
                <input
                  type="number"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {addType === 'PART_TIME' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formHourly}
                  onChange={(e) => setFormHourly(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Weekly Hours</label>
                <input
                  type="number"
                  value={formWeeklyHours}
                  onChange={(e) => setFormWeeklyHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {addType === 'CONTRACTOR' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Consulting Agency</label>
                <input
                  type="text"
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formContractRate}
                  onChange={(e) => setFormContractRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Assignment</label>
                <input
                  type="text"
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

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
              Save Personnel Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PERSONNEL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Personnel Profile"
        subtitle={`Updating ID: ${formId}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
              <input
                type="text"
                required
                value={formFirst}
                onChange={(e) => setFormFirst(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formLast}
                onChange={(e) => setFormLast(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          {selectedType === 'FULL_TIME' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                <input
                  type="text"
                  value={formDeptName}
                  onChange={(e) => setFormDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Salary ($/yr)</label>
                <input
                  type="number"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'PART_TIME' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formHourly}
                  onChange={(e) => setFormHourly(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Weekly Hours</label>
                <input
                  type="number"
                  value={formWeeklyHours}
                  onChange={(e) => setFormWeeklyHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'CONTRACTOR' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Contract Rate ($/hr)</label>
                <input
                  type="number"
                  value={formContractRate}
                  onChange={(e) => setFormContractRate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Agency</label>
                <input
                  type="text"
                  value={formAgency}
                  onChange={(e) => setFormAgency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

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

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Personnel Deletion"
        subtitle="Caution: Irreversible database action"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete{' '}
            <strong>
              {selectedRecord?.first_name} {selectedRecord?.last_name}
            </strong>{' '}
            ({selectedRecord?.emp_id || selectedRecord?.contractor_id})?
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
              Delete Personnel Record
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
