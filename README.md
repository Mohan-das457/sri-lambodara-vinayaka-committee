# 🛕 Sri Lambodara Vinayaka Committee Management System
### శ్రీ లంబోదర వినాయక కమిటీ నిర్వహణ వ్యవస్థ

A full-stack web and mobile application designed to simplify temple committee operations, monthly member contribution collections, recurring meeting management, attendance tracking, financial records, festival funds, and bilingual member communication.

---

## 🌟 Key Features

1. **👥 Member Management (సభ్యుల నిర్వహణ)**
   - Committee member registry with unique IDs (`SLV-001`, `SLV-002`, etc.).
   - Bilingual Telugu & English designations (President / అధ్యక్షులు, Treasurer / కోశాధికారి, Secretary / కార్యదర్శి, Members).
   - Member profile drawer with individual transaction history and pending dues summary.

2. **💰 Monthly Contributions (నెలవారీ చందాలు)**
   - Configurable monthly due amount (standard ₹500/month).
   - Automated due generation for all active members.
   - Status tracking: **Paid (చెల్లించబడింది)**, **Pending (బకాయి ఉంది)**, **Partial (కొంత భాగం)**.
   - Cash and UPI payment recording with UTR/transaction reference verification.
   - **One-click WhatsApp Reminders** that open pre-filled friendly messages in Telugu.

3. **🧾 Digital Payment Receipts (డిజిటల్ రసీదులు)**
   - Unique official receipt numbering format (e.g. `SLV-REC-2026-1001`).
   - Dedicated printable & downloadable receipt view with temple header, bilingual details, QR verification badge, and authorized signature.

4. **📅 Meeting Management (సమావేశాలు & హాజరు)**
   - Scheduled recurring monthly meetings on the **15th of every month at 7:30 PM**.
   - Agendas, Minutes of Meeting (MoM), and Committee Resolutions recording.
   - Interactive member-by-member attendance tracker (**Present**, **Absent**, **Excused**).
   - WhatsApp Meeting Notice broadcast generator.

5. **📊 Financial & Festival Funds (ఆర్థిక & ఉత్సవ నిధులు)**
   - **General Temple Fund (సాధారణ ఆలయ నిధి)**: Monthly dues, daily pooja items, electricity, maintenance.
   - **Ganesh Utsav Festival Fund (గణేష్ ఉత్సవ నిధి)**: Dedicated Vinayaka Chavithi donations, annadanam sponsorships, idol booking, pandals, and procession expenses.
   - Expense vouchers and donation receipt tracking.
   - Comprehensive consolidated financial statement report with printable summary.

6. **🌐 Bilingual Telugu & English Localization (ద్విభాషా మద్దతు)**
   - Instant header toggle between **తెలుగు** and **English**.
   - Full translation coverage of navigation, tables, forms, badges, and receipts.

7. **🔐 Role-Based Access Control (RBAC) & Demo Accounts**
   - Pre-configured demo accounts for one-click testing:
     - **Admin (అధ్యక్షులు)**: `admin` / `admin123` — Full system control.
     - **Treasurer (కోశాధికారి)**: `treasurer` / `treasurer123` — Dues, payments, expenses, donations, funds.
     - **Secretary (కార్యదర్శి)**: `secretary` / `secretary123` — Meetings, minutes, attendance, announcements.
     - **Member (సభ్యుడు)**: `member` / `member123` — Personal dues, payment history, and meeting notices.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Lucide Icons, Canvas Confetti |
| **Styling** | Vanilla CSS Spiritual Design System (Obsidian, Temple Gold, Sacred Vermilion, Sandalwood) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.x with automatic resilient JSON persistence fallback (`backend/data/store.json`) |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs password hashing |
| **Typography** | Cinzel (Classical Heading), Outfit (UI Sans), Noto Sans Telugu (Telugu Script) |

---

## 🚀 Running the Application Locally

### 1. Start the Backend API (Port 5001)

```bash
cd backend
npm install
npm run dev
```

The backend server runs on `http://localhost:5001`.
- Health Check: `http://localhost:5001/api/health`
- API Root: `http://localhost:5001/`

### 2. Start the Frontend Application (Port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open your browser to:
👉 **`http://localhost:3000`**

---

## 🗄️ MySQL Database Setup (Optional)

The application includes an automatic hybrid fallback: it connects to MySQL if available, and seamlessly uses persistent local storage if MySQL credentials are not yet configured.

To connect your local MySQL server:
1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Create database and import schema:
   ```sql
   CREATE DATABASE temple_committee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE temple_committee;
   SOURCE backend/src/data/schema.sql;
   ```
3. Update `backend/.env`:
   ```dotenv
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=temple_committee
   ```
4. Restart the backend server.

---

## 📱 Mobile Applications (Future Roadmap)

Flutter Android and iOS apps sharing the same Express REST API will be developed in the next phase.
