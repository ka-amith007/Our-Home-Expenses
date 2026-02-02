# Our Home Expenses – Shared Expense Tracker

Our Home Expenses is a modern, cloud-based expense tracking web application built for private households. It helps roommates or family members track shared costs, calculate splits, and manage balances with a clean, professional, and ultra-responsive interface.

## 🚀 Core Features

- **Excel-like Expense Table**: Inline editing for rapid data entry and management.
- **Automatic Calculations**: Real-time updates for monthly totals, individual spending, and equal splits.
- **Smart Settlements**: Instant visibility into "who owes whom" based on recorded expenses.
- **Live Search & Filters**: Quickly find expenses by month, category, or person.
- **Dashboard Visualizations**: Interactive charts (pie and bar) for spending trends and category breakdowns.
- **Professional CSV Export**: Download your data for archival or external analysis.
- **Security & Roles**: Secure authentication with specific access levels for different users.

## 🛡️ User Roles

The application is configured for a private household with two distinct roles:

1. **Manager (Admin)**: Full control over the application.
   - Add, edit, and delete expense entries.
   - Manage application settings (categories, roommates, limits).
2. **Viewer**: Read-only access to data.
   - View expense tables, summaries, and charts.
   - Export data to CSV.

## 💻 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS) enforced at the database level

## 🛠️ Local Setup

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd house-share-tracker
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

4. **Start the development server**:
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:8080`.

## 📄 License

Private household use only.
