# WISH 💛

A minimalist, quiet, and semi-anonymous platform designed to facilitate the requesting and granting of small airtime and data needs in Nigeria. **WISH** focuses on community kindness through a modern, "Glassmorphism" inspired interface.

![WISH Preview](assets/og-image.png)

## ✨ Features

- **Modern Glassmorphism UI**: A sleek, translucent interface built with Tailwind CSS and custom CSS variables.
- **Adaptive Theming**: Full support for native Light and Dark modes with smooth transitions.
- **Anonymous Gifting**: Grant airtime or data wishes without revealing your identity to the recipient.
- **Secure Payments**: Integration ready for Paystack via the FastAPI backend.
- **Automated Fulfillment**: Integration ready for Shago VTU API for automated airtime/data delivery.
- **Real-time Dashboard**: Track your "Kindness Impact" and manage active wishes via a secure REST API.
- **Performance Focused**: Optimized with shimmer loading states (Skeleton screens) and responsive design for all devices.

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES Modules).
- **Backend**: FastAPI (Python 3.10+).
- **Database**: PostgreSQL (Production) / SQLite (Development).
- **Fulfillment**: VTU API Integration.

## 📂 Project Structure
```text
project-root/
├── frontend/                 # Client-side application
│   ├── public/               # Images, fonts, and favicon
│   ├── js/                   # Modular ES6 scripts (auth.js, wishes.js, etc.)
│   ├── styles/               # CSS and theme variables
│   └── pages/                # HTML files (index.html, dashboard.html, etc.)
├── backend/                  # FastAPI Server
│   ├── app/
│   │   ├── routes/           # API endpoints (Wishes, Auth, Payments)
│   │   ├── services/         # Business logic (Paystack & VTU integration)
│   │   ├── models/           # Database schemas (PostgreSQL tables)
│   │   ├── schemas/          # Pydantic models for data validation
│   │   └── main.py           # Application entry point
│   ├── .env                  # Secrets (Paystack Keys, Database URL)
│   └── requirements.txt      # Python dependencies
└── README.md                 # Project documentation
```

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/wish-platform.git
cd wish-platform
```

### 2. Configure API Endpoint
Ensure the `API_CONFIG.BASE_URL` in `frontend/public/js/constants.js` points to your partner's FastAPI API (default is `http://localhost:8000/api`).

### 3. Backend Setup (FastAPI)
Your partner should set up the FastAPI project in the `backend/` directory. Ensure `CORSMiddleware` is configured to allow requests from your frontend's local address.

### 4. Local Development
Use a local static file server to run the frontend:
*   **VS Code**: Use the "Live Server" extension.
*   **Node.js**: Run `npx http-server frontend/public`.
*   **Python**: Run `python -m http.server` inside the `frontend/public` folder.

## 📁 Project Structure
  - `/js`: Modular ES6 scripts (Auth, Wishes, Payments, Utils).
  - `/css`: Custom styles and theme variables.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with 💛 to spread kindness.*