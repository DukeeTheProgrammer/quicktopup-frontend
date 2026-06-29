# QuickTopUp Frontend

> A fast, modern VTU (Virtual Top-Up) web app for Nigerian and Ghanaian mobile services — built with React 19.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Authentication** — Register, Login, Forgot/Reset Password, Google OAuth, Set Transaction PIN
- **Wallet** — Fund wallet via Flutterwave, view balance, transaction ledger
- **Airtime** — Nigeria & Ghana: MTN, Airtel, Glo, 9Mobile, Vodafone, AirtelTigo
- **Data Bundles** — Browse and buy plans by network, filtered live from the API
- **Cable TV** — DSTV, GOtv, Startimes — wallet-deducted instantly
- **Electricity** — All Nigerian DISCOs, prepaid & postpaid
- **Transaction History** — Paginated, filterable by status / service / date range
- **Notifications** — In-app alerts with mark-as-read
- **Profile & Security** — Update personal info, set 4-digit transaction PIN, KYC verification
- **PIN Modal** — 4-digit PIN confirmation for all wallet purchases
- **Admin Dashboard** — KPI cards, system health, provider metrics, daily trends
- **Onboarding Tour** — Welcome wizard for first-time users
- **Customer Support Chatbot** — In-app FAQ bot with pattern matching
- **Dark/Light Theme** — System-aware theme toggle with persistence

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React ^19.2.6 |
| Routing | React Router ^7.15.1 |
| HTTP Client | Axios ^1.16.1 |
| Icons | Lucide React ^1.16.0 |
| Toasts | React Hot Toast ^2.6.0 |
| Styling | Custom CSS (no UI library) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/quicktopup-frontend.git
cd quicktopup-frontend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```env
REACT_APP_API_BASE_URL=/api
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your-client-id
```

### Run Locally

```bash
npm start
```

App runs at `http://localhost:3000`

### Production Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   ├── client.js              # Axios instance + auth interceptor
│   ├── auth.js                # register, login, logout, profile, set-pin
│   ├── wallet.js              # getWallet, fundWallet, getWalletLedger
│   ├── transactions.js        # purchaseAirtime, purchaseData, etc.
│   ├── services.js            # getNetworks, getDataPlans, getCablePlans
│   ├── notifications.js       # getNotifications, markNotificationRead
│   └── admin.js               # getAdminDashboard
├── components/
│   ├── Layout.js              # Sidebar + topbar shell
│   ├── CustomerSupport.js     # FAQ chatbot widget
│   └── GoogleSignInButton.js  # Google OAuth button
├── context/
│   ├── AuthContext.js         # Token + user session management
│   └── ThemeContext.js        # Dark/light theme toggle
└── pages/
    ├── auth/                  # Login, Register, ForgotPassword, ResetPassword
    ├── landing/               # Marketing landing page
    ├── dashboard/             # Wallet hero + quick services + recent txns
    ├── services/              # Airtime, Data, CableTV, Electricity + PinModal
    ├── wallet/                # Wallet balance, Fund modal, Ledger tab
    ├── transactions/          # Paginated history with filters
    ├── notifications/         # Notification centre
    ├── profile/               # Profile info + Set Transaction PIN
    ├── kyc/                   # KYC verification (NIN/BVN/Ghana Card)
    ├── welcome/               # Onboarding tour
    └── admin/                 # Admin dashboard
```

## API Integration

**Base URL:** `https://quicktopup.it.com/api` (production) / `http://localhost:8000/api` (dev)
**Auth:** `Authorization: Token <token>` header on all authenticated requests

## Deployment

### Docker

```bash
docker compose up -d
```

### Vercel

Connect the GitHub repo — Vercel auto-detects React. The `vercel.json` rewrites `/api/*` to the backend.

## Support

- Email: quicktopup.it.com@gmail.com

## License

MIT © 2026 QuickTopUp
