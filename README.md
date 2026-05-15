# QuickTopUp.ng Frontend

> ⚡ A fast, modern VTU (Virtual Top-Up) web app for Nigerian mobile services — built with React.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react) ![License](https://img.shields.io/badge/license-MIT-green) ![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

---

## 📱 Features

- 🔐 **Authentication** — Register, Login, Forgot/Reset Password
- 💰 **Wallet** — Fund wallet, view balance, transaction ledger
- 📱 **Airtime** — Buy airtime for MTN, Airtel, Glo, 9Mobile
- 📶 **Data Bundles** — Browse and buy data plans by network
- 📺 **Cable TV** — Subscribe to DSTV, GOtv, Startimes, Showmax
- ⚡ **Electricity** — Pay electricity bills (all DISCOs supported)
- 📋 **Transaction History** — Filter by status, service type, date range
- 🔔 **Notifications** — In-app alerts with mark-as-read
- 👤 **Profile & Security** — Update personal info, manage security settings
- 🔒 **PIN Modal** — 4-digit transaction PIN for all purchases

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

Open `src/api/client.js` and update the base URL to point to your backend:

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

Built files go into the `/build` folder — ready to deploy.

---

## 📁 Project Structure

```
src/
├── api/              # Axios API clients (auth, wallet, transactions, services)
├── components/       # Shared components (Layout, Sidebar, Topbar)
├── context/          # AuthContext (user session management)
└── pages/
    ├── auth/         # Login, Register, ForgotPassword, ResetPassword
    ├── dashboard/    # Main dashboard
    ├── services/     # Airtime, Data, Cable TV, Electricity + PIN Modal
    ├── wallet/       # Wallet balance, fund modal, ledger
    ├── transactions/ # Transaction history with filters
    ├── notifications/# Notification center
    └── profile/      # Profile & security settings
```

---

## 🔌 API Integration

This frontend connects to the **QuickTopUp.ng Django REST API**.

| Endpoint Group | Base Path |
|---------------|-----------|
| Auth | `/api/auth/` |
| Wallet | `/api/wallet/` |
| Transactions | `/api/transactions/` |
| Services | `/api/services/` |
| Notifications | `/api/notifications/` |

All requests use **Token-based authentication** — the token is stored in `localStorage` after login.

---

## 🚢 Deployment

### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/quicktopup/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

### Vercel / Netlify

Just connect the GitHub repo — both platforms auto-detect React and configure the build command (`npm run build`) and publish directory (`build/`) automatically.

---

## 📞 Support

- Email: quicktopup.it.com@gmail.com
- Docs: https://docs.quicktopup.it.com
- Status: https://status.quicktopup.it.com

---

## 📄 License

MIT © 2026 QuickTopUp.ng
