# ELECTROHUB
### Smart Electronics Inventory & Management System
> "Manage your electronics business smarter, faster and from one place."

ElectroHub is a modern, enterprise SaaS-grade electronics inventory, customer CRM, order fulfillment, and workforce management platform designed specifically for electronic component distributors, hardware startups, robotics labs, and semiconductor suppliers.

---

## ⚡ Key Highlights & Features

- **Executive Telemetry Dashboard**: 8 real-time KPI metrics (Total Products, Customers, Orders, Employees, Low Stock, Out of Stock, Discontinued, and Gross Revenue), interactive SVG trend & category charts, working Quick Actions, and live operational activity feeds.
- **Dynamic Inventory Control Engine**: Visual status indicators (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`), automatic safety threshold warnings, progress bars, and quick stock intake/dispatch actions.
- **Component Catalog Management**: Deep indexing of MCUs, ICs, sensors, displays, power cells, and instrumentation with search, category filtering, price/stock sorting, pagination, specification modals, and obsolescence archiving.
- **End-to-End Order Fulfillment**: Multi-item purchase order cart, automatic real-time stock deduction, invoice generation, customer spend recalculation, and status workflows (`Pending` → `Processing` → `Completed` → `Cancelled`).
- **Customer CRM**: Client dossiers, affiliation tracking (robotics labs, aerospace, universities), lifetime spend counters, and chronological order histories.
- **Tiered Workforce Directory**: Comprehensive management segregated by **Full-Time** staff (salaries, health benefits, paid leave), **Part-Time** lab technicians (hourly rates, shifts), and **Hardware Contractors** (agency, rate, project assignment, contract end date).
- **Discontinued Products Registry**: Dedicated archive distinguishing retired or RoHS-restricted parts from active stock, with detailed obsolescence justifications and instant 1-click reactivation.
- **Business Intelligence & Analytics**: Interactive SVG trend lines, category share breakdowns, stock health breakdown, and top-tier customer spending leaderboards.
- **Global Search & Command Palette (`Ctrl + K`)**: Instant keyboard-driven global search across products, clients, purchase orders, and workforce with categorized results.
- **Real-Time Notification System**: Popover alerting operators to critical zero-stock situations, threshold alerts, and recent incoming purchase orders.
- **Full Supabase & PostgreSQL Integration**: Includes complete DDL schema (`supabase_schema.sql`) with tables, foreign keys, RLS policies, and demo seed data. Features in-app connection testing and zero-friction local persistence fallback.
- **Accessibility & UX**: Dark tech theme, light mode, compact mode, toasts, accessible confirmation modals, and 100% mobile-responsive drawer navigation.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Glassmorphism, Custom SVG Charts
- **Database & Auth**: Supabase, PostgreSQL, Supabase Auth
- **Icons**: Lucide React
- **Notifications**: Custom Event-Driven Toast Engine

---

## 🚀 Getting Started

### 1. Installation

```bash
cd electrohub
npm install
```

### 2. Run the Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Build for Production

```powershell
npm run build
npm start
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Paste and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
4. Set your credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

*Alternatively, navigate to **Settings** in the ElectroHub web application and enter your Supabase URL and Anon Key directly in the UI!*

---

## 🎓 Viva & Project Demonstration Walkthrough

1. **Landing Page (`/`)**: Show the hero section, interactive live preview dashboard, feature breakdown, operational workflow, and technology section.
2. **Login (`/login`)**: Demonstrate the modern login page, show/hide password toggle, and use the **"Fast Evaluation Credentials"** buttons (*Demo Admin* or *Demo Staff*) to sign in instantly.
3. **Dashboard (`/dashboard`)**:
   - Highlight the 8 top stat cards with hover animations.
   - Demonstrate the **Quick Actions** ("Add Product", "Add Customer", "Create Order"). Show how adding an order immediately adjusts inventory stock and updates customer spend.
   - Point out the interactive SVG charts (Order Trends, Category Distribution, Stock Status).
4. **Global Search (`Ctrl + K`)**: Press `Ctrl+K` or click the search bar in the top navbar. Type `"STM32"` or `"Chen"` to demonstrate instant categorized search across all database entities.
5. **Inventory Control (`/inventory`)**: Review the visual stock levels and demonstrate the `+5` or `+25` quick receiving action or open the intake shipment modal.
6. **Products (`/products`)**: Filter by category ("Sensors & Modules"), sort by price, view details modal, and demonstrate the **Discontinue** action.
7. **Discontinued Registry (`/discontinued-products`)**: Show how the discontinued component appears in the archive with obsolescence reason, and click **Reactivate** to bring it back to active stock.
8. **Orders & Invoices (`/orders`)**: View an order to show the itemized invoice and change its fulfillment status.
9. **Workforce (`/employees`)**: Switch between the **All**, **Full-Time**, **Part-Time**, and **Contractors** tabs to show the differing relational compensation fields.
10. **Settings (`/settings`)**: Demonstrate switching between Dark Tech Mode, Light Mode, and Compact Mode. Show the "Clear Database" button to prove the system gracefully handles empty database states ("No products yet"), then click "Reload Demo Dataset" to restore full records.
