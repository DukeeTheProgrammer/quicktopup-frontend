# QuickTopUp.ng Frontend

> ⚡ A fast, modern VTU (Virtual Top-Up) web app for Nigerian and Ghanaian mobile services — built with React.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react) ![License](https://img.shields.io/badge/license-MIT-green) ![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

---

## 📱 Features

- 🔐 **Authentication** — Register, Login, Forgot/Reset Password, Set Transaction PIN
- 💰 **Wallet** — Fund wallet via Flutterwave, view balance, transaction ledger
- 📱 **Airtime** — Nigeria & Ghana: MTN, Airtel, Glo, 9Mobile, Vodafone, AirtelTigo
- 📶 **Data Bundles** — Browse and buy plans by network, filtered live from the API
- 📺 **Cable TV** — DSTV, GOtv, Startimes, Showmax — wallet-deducted instantly
- ⚡ **Electricity** — All Nigerian DISCOs, prepaid & postpaid, wallet-deducted
- 📋 **Transaction History** — Paginated, filterable by status / service / date range
- 🔔 **Notifications** — In-app alerts with mark-as-read
- 👤 **Profile & Security** — Update personal info, set 4-digit transaction PIN
- 🔒 **PIN Modal** — 4-digit PIN confirmation for all wallet purchases

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Styling | Custom CSS (no UI library) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/DukeeTheProgrammer/quicktopup-frontend.git
cd quicktopup-frontend
npm install
```

### Environment Setup

Update `src/api/client.js` with your backend URL:

```js
const BASE_URL = 'https://your-backend-url.com/api';
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

---

## 📁 Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance + auth interceptor
│   ├── auth.js            # register, login, logout, profile, set-pin
│   ├── wallet.js          # getWallet, fundWallet, getWalletLedger
│   ├── transactions.js    # purchaseAirtime, purchaseData, purchaseCable,
│   │                      #   purchaseElectricity, getTransactions
│   ├── services.js        # getNetworks, getDataPlans, getCablePlans,
│   │                      #   getElectricityBillers
│   └── notifications.js   # getNotifications, markNotificationRead
├── components/
│   └── Layout.js          # Sidebar + topbar shell
├── context/
│   └── AuthContext.js     # Token + user session management
└── pages/
    ├── auth/              # Login, Register, ForgotPassword, ResetPassword
    ├── dashboard/         # Wallet hero + quick services + recent txns
    ├── services/          # Airtime, Data, CableTV, Electricity + PinModal
    ├── wallet/            # Wallet balance, Fund modal, Ledger tab
    ├── transactions/      # Paginated history with filters
    ├── notifications/     # Notification centre
    └── profile/           # Profile info + Set Transaction PIN
```

---

## 🔌 API Integration

This frontend connects to the **QuickTopUp.ng Django REST API**.

**Base URL:** `https://unmade-backboned-agreeably.ngrok-free.dev/api` (dev)  
**Auth:** `Authorization: Token <token>` header on all authenticated requests

### Response shapes (confirmed from live API)

All authenticated list endpoints return a paginated DRF envelope:
```json
{
  "success": true,
  "data": {
    "count": 42,
    "next": "http://.../?page=2",
    "previous": null,
    "results": [ ... ]
  }
}
```

Single-object endpoints return:
```json
{ "success": true, "data": { ... } }
```

`GET /api/notifications/` is the **only** exception — it returns the DRF paginator directly (no `success`/`data` wrapper):
```json
{ "count": 5, "next": null, "previous": null, "results": [ ... ] }
```

### Confirmed purchase field names (from live testing)

| Endpoint | Required fields |
|----------|----------------|
| `POST /transactions/airtime/` | `phone`, `network` (uppercase e.g. `MTN`), `amount`, `pin` |
| `POST /transactions/data/` | `phone`, `network`, `plan_id`, `pin` |
| `POST /transactions/cable/` | `smart_card` (**not** `smartcard_number`), `provider` (lowercase e.g. `dstv`), `plan_id`, `pin` |
| `POST /transactions/electricity/` | `provider` (**not** `biller`), `meter_number`, `meter_type`, `amount`, `pin` |
| `POST /auth/set-pin/` | `new_pin`, `pin_confirm` |

> ⚠️ `POST /transactions/initiate-payment/` has a server-side `NameError` and is not operational. Direct purchase endpoints above should be used instead.

### Service providers

| Provider | Country | Services |
|----------|---------|----------|
| **VTU.ng** | 🇳🇬 Nigeria | Airtime, Data, Cable, Electricity |
| **VTPass** | 🇳🇬 Nigeria | Airtime, Data, Cable, Electricity |
| **Hubtel** | 🇬🇭 Ghana | Airtime, Data, Mobile Money |
| **Flutterwave** | Both | Wallet Funding Payments |

---

## 🔒 Transaction PIN

All service purchases require a 4-digit transaction PIN. Users must set their PIN first via **Profile → Security → Set Transaction PIN**, which calls:

```
POST /api/auth/set-pin/
{ "new_pin": "1234", "pin_confirm": "1234" }
```

If no PIN is set, the API returns `{ "code": "PIN_REQUIRED", "message": "Please set your transaction PIN first" }`.

---

## 💳 Wallet Funding

Wallet funding uses Flutterwave. The flow:

1. Frontend calls `POST /api/wallet/fund/` with `{ amount, payment_method, redirect_url }`
2. Backend returns a `payment_link` from Flutterwave
3. User is redirected to `payment_link` to complete payment
4. Flutterwave redirects back to `redirect_url` with `?tx_ref=...&status=successful`
5. The wallet page detects the query params and shows a success/failure toast

---

## 🚢 Deployment

### Vercel

Connect the GitHub repo — Vercel auto-detects React:
- Build command: `npm run build`
- Output directory: `build`

The `vercel.json` rewrites all `/api/*` requests to the backend to avoid CORS issues in production.

### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/quicktopup/build;
    index index.html;
    location / { try_files $uri /index.html; }
}
```

---

## 📞 Support

- Email: quicktopup.it.com@gmail.com
- Docs: https://docs.quicktopup.it.com
- Status: https://status.quicktopup.it.com

---

## 📄 License

MIT © 2026 QuickTopUp.ng
