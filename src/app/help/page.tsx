'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Cpu,
  Boxes,
  ShoppingBag,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Rocket,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface FAQItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    topic: 'Getting Started',
    question: 'How do I initialize ElectroHub and start managing inventory?',
    answer:
      'ElectroHub comes out-of-the-box with a high-fidelity electronics dataset including MCUs, sensors, power cells, and robotics boards. To explore the platform, check the Dashboard for top statistics, click "Add Product" to register new hardware, or navigate to Settings to connect your live Supabase PostgreSQL credentials.',
  },
  {
    id: 'gs-2',
    topic: 'Getting Started',
    question: 'How do I connect my own Supabase database?',
    answer:
      'Go to the Settings page. Enter your Supabase Project URL (e.g., https://your-project.supabase.co) and your Public Anon Key. You can apply the complete database schema by executing the provided "supabase_schema.sql" file in your Supabase SQL Editor.',
  },

  // Products
  {
    id: 'prd-1',
    topic: 'Products',
    question: 'How does product classification and SKU indexing work?',
    answer:
      'Every electronic component belongs to one of ten discrete hardware categories (Microcontrollers, Sensors, Displays, Power, Wireless, GPUs, etc.). When cataloging a product, specify the unique Product ID, SKU code, unit wholesale price, current shelf quantity, and minimum reorder threshold.',
  },
  {
    id: 'prd-2',
    topic: 'Products',
    question: 'What happens when a product is discontinued?',
    answer:
      'Discontinuing an item archives the product and moves it from the active inventory catalog to the Discontinued Products Registry. This prevents new orders while preserving historical ledger accuracy for past purchase invoices.',
  },

  // Inventory
  {
    id: 'inv-1',
    topic: 'Inventory',
    question: 'How are stock statuses (IN STOCK, LOW STOCK, OUT OF STOCK) determined?',
    answer:
      'Status is computed dynamically: If stock equals 0, the product becomes OUT OF STOCK with a red pulsing indicator. If stock is greater than 0 but less than or equal to the minimum reorder threshold, it shifts to LOW STOCK. When stock exceeds the threshold, it is marked IN STOCK.',
  },
  {
    id: 'inv-2',
    topic: 'Inventory',
    question: 'Can I perform quick stock intake receiving when a supplier shipment arrives?',
    answer:
      'Yes. In the Inventory page, you can use the quick-increment buttons (+5, +25) on any row or click the "Adjust" action to log inbound shipment intakes or warehouse dispatches.',
  },

  // Orders
  {
    id: 'ord-1',
    topic: 'Orders',
    question: 'Does creating a customer purchase order automatically deduct inventory?',
    answer:
      'Yes. ElectroHub features atomic stock deductions: when a purchase order is submitted, the system verifies available inventory for each line item and immediately deducts the purchased quantities from warehouse stock in real-time.',
  },
  {
    id: 'ord-2',
    topic: 'Orders',
    question: 'Can I view line item invoices and alter fulfillment status?',
    answer:
      'Click the eye icon on any order row in the Orders page to view the complete formatted invoice, customer address, payment terms, and status dropdown (Pending, Processing, Completed, Cancelled).',
  },

  // Customers
  {
    id: 'cust-1',
    topic: 'Customers',
    question: 'How does the CRM calculate customer spend and lifetime orders?',
    answer:
      'Whenever an order is completed or processed, the customer\'s cumulative spend is automatically updated, and their order count increments. You can click "View Dossier" on any customer to see their chronological purchase history.',
  },

  // Employees
  {
    id: 'emp-1',
    topic: 'Employees',
    question: 'How does ElectroHub categorize the workforce?',
    answer:
      'Personnel is segregated into three specialized tiers: Full-Time staff (with annual salaries, benefits, and paid leave), Part-Time laboratory technicians (with hourly rates, weekly hours, and shift schedules), and specialized Hardware Contractors (with consulting agencies, hourly rates, project assignments, and contract end dates).',
  },

  // Analytics
  {
    id: 'ana-1',
    topic: 'Analytics',
    question: 'How are analytics charts generated?',
    answer:
      'All charts in the Analytics and Dashboard pages are responsive SVG components computed directly from actual database records. They dynamically recalculate order trend lines, category shares, and stock readiness whenever database changes occur.',
  },

  // Settings
  {
    id: 'set-1',
    topic: 'Settings',
    question: 'How do I test empty database behavior for project evaluation or viva?',
    answer:
      'In the Settings page under "Data Management & Viva Demonstration Tools", click "Clear Database". The entire system will transition to genuine empty states ("No products yet", "No orders yet"). You can reload the sample electronics dataset at any moment by clicking "Reload Demo Dataset".',
  },
];

const TOPICS = [
  'All Topics',
  'Getting Started',
  'Products',
  'Inventory',
  'Orders',
  'Customers',
  'Employees',
  'Analytics',
  'Settings',
];

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [expandedId, setExpandedId] = useState<string | null>('gs-1');

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesTopic = selectedTopic === 'All Topics' || item.topic === selectedTopic;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q);
      return matchesTopic && matchesSearch;
    });
  }, [selectedTopic, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Help Center & System Guide</h2>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-0.5 rounded-full font-medium">
              Knowledge Base
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Documentation, operation manuals, and architectural reference for ElectroHub.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search help topics, FAQs, guides, or operational questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xl"
          />
        </div>

        {/* Topic Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* FAQs List Accordion */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <h4 className="text-base font-semibold text-white">No answers found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for different terms like &quot;stock&quot;, &quot;order&quot;, or &quot;Supabase&quot;.
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = expandedId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {faq.topic}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{faq.question}</h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Viva / Project Reference Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Project Evaluation & Architecture Highlights</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ElectroHub was built strictly from scratch with Next.js App Router, React 19, TypeScript, and Supabase PostgreSQL.
                It incorporates a dual-mode database engine (live Supabase sync + offline fallback), complete relational tables with foreign keys (<code className="text-blue-400">orders.customer_id &rarr; customers.customer_id</code>), real-time stock alert recalculations, and accessibility-compliant UI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
