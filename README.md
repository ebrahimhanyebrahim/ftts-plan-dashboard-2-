# 📡 FTTS Plan Overall Dashboard | لوحة المتابعة الشاملة لمشروعات الاتصالات والفايبر

An enterprise-grade, responsive Web Application that recreates and elevates telecom rollout monitoring dashboards (Power BI style). Built for real-world telecom rollout tracking across Egypt, featuring direct integrations with operator Excel data, dynamic Excel upload & analysis, and interactive cross-filtering.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/React%2019-TypeScript-blue?style=for-the-badge)
![Styling](https://img.shields.io/badge/Tailwind%20CSS%20v4-Vite-38bdf8?style=for-the-badge)

---

## 🌟 Key Features

### 1. 🗼 Multi-Project National Scope Switcher
Seamlessly navigate between distinct telecom and national fiber projects:
- **FTTS Mobile Towers Rollout (مشروعات أبراج المحمول)**:
  - **Vodafone (345 Sites)**: Direct data from `ftts.xlsx` with delivery, permit, obstacle, and civil/electrical breakdown.
  - **Orange (121 Sites)**: Direct data from `ftts.xlsx` with status tracking and reasons for stall.
  - **WE - Telecom Egypt (585 Sites)**: Direct data from `We.xlsx` with WE purple corporate identity.
  - **All Operators (1,051 Sites)**: Unified executive FTTS rollout view.
- **Network & FTTH Availability (مشروع الإتاحة)**:
  - 1,374 client & branch sites from `الاتاحه .xlsx` (Schools, Banks, Customs, Tax authorities, Commercial hubs).
- **Governmental Digital Transformation (مشروع التحول الرقمي)**:
  - 380 governmental buildings from `بيان التحول الرقمى.xlsx` across Egyptian Ministries (Interior, Justice, Health, Social Solidarity, Supply, etc.).
- **Custom Upload & Analysis (ملف مخصص)**:
  - Dedicated engine to analyze any external uploaded Excel file on the fly.

### 2. 📊 Interactive Visualizations & Analytics
- **Interactive SVG Donut Chart**: Hover tooltips with percentage and count, slice click-to-filter, and dynamic center total.
- **Power BI Style Summary Table**: Sortable columns (*موقف العام, N.Sites, No. Links*), in-cell data-bars, row selection for cross-filtering, and prominent total footer.
- **Dynamic KPI Cards**: Instant calculation of Total Sites, Total Links, Delivered/Completed, Permits in Progress, and Obstacles with live completion percentages.
- **Comprehensive Slicers (فلاتر التصفية)**: 6 interactive dropdown filters (*القطاع، الإدارات العامة، الإدارات المختصة، الاسترال، التصنيف، أسباب التعذر*) with search and matching record counters.
- **Site Details Modal (سجل تفاصيل المواقع)**: Full drill-down modal with real-time search, pagination, contractor notes, and instant CSV export.

### 3. 📂 Dynamic Excel Upload & Analysis Suite
- Drag & drop or browse `.xlsx`, `.xls`, or `.csv` files.
- Smart column auto-detection and normalization (handles Arabic & English headers).
- Flexible status and operator mapping.
- Instant pre-application data preview.
- Built-in downloadable Excel template (`FTTS_Plan_Upload_Template.xlsx`).

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Excel & Spreadsheet Engine**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Typography**: Google Fonts (*Cairo* for Arabic, *Inter* for English)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ebrahimhanyebrahim/ftts-plan-overall-dashboard.git

# Navigate into project directory
cd ftts-plan-overall-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be live at `http://localhost:5174/` (or your assigned Vite port).

### Building for Production

```bash
npm run build
```

The production-ready assets will be generated in the `dist/` directory.

---

## 📁 Project Architecture

```
ftts-plan-dashboard/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Executive header, CSV export, Print, and Upload trigger
│   │   ├── ProjectTabs.tsx         # National project scope switcher (FTTS, Etaha, Tahawol)
│   │   ├── KpiCards.tsx            # Dynamic KPI metric cards with completion rates
│   │   ├── CompanySelector.tsx     # Full-width operator and entity selector cards
│   │   ├── DonutChart.tsx          # Interactive SVG donut chart with tooltips & center total
│   │   ├── SummaryTable.tsx        # Sortable summary table with Power BI data-bars
│   │   ├── Filters.tsx             # 6 dynamic dropdown slicers with search
│   │   ├── SiteDetailsModal.tsx    # Detailed site records drilldown modal with pagination
│   │   └── ExcelUploaderModal.tsx  # Excel file upload, preview, and template generator
│   ├── data/
│   │   ├── dashboardData.ts        # Status configs, color palettes, and helpers
│   │   └── preloadedProjects.ts    # Normalized datasets from ftts.xlsx, We.xlsx, Etaha, Tahawol
│   ├── types/
│   │   └── dashboard.ts            # TypeScript interfaces and data models
│   ├── utils/
│   │   └── excelParser.ts          # Client-side Excel parsing & column normalization
│   ├── pages/
│   │   └── Dashboard.tsx           # Main application state orchestration
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Tailwind v4 configuration and Cairo typography
├── scripts/
│   └── buildDatasets.cjs           # Data transformation script for raw Excel sources
├── package.json
└── vite.config.ts
```

---

## 📄 License
This project is proprietary and built for enterprise telecommunications network rollout tracking.
