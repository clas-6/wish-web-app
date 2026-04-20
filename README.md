# WISH 💛

A minimalist, quiet, and semi-anonymous platform designed to facilitate the requesting and granting of small airtime and data needs in Nigeria. **WISH** focuses on community kindness through a modern, "Glassmorphism" inspired interface.

![WISH Preview](https://wish-app.web.app/assets/og-image.png)

## ✨ Features

- **Modern Glassmorphism UI**: A sleek, translucent interface built with Tailwind CSS and custom CSS variables.
- **Adaptive Theming**: Full support for native Light and Dark modes with smooth transitions.
- **Anonymous Gifting**: Grant airtime or data wishes without revealing your identity to the recipient.
- **Secure Payments**: Integration ready for Paystack for reliable transaction processing.
- **Automated Fulfillment**: Integration ready for Shago VTU API for automated airtime/data delivery.
- **Real-time Dashboard**: Track your "Kindness Impact" and manage active wishes via a secure REST API.
- **Performance Focused**: Optimized with shimmer loading states (Skeleton screens) and responsive design for all devices.

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES Modules).
- **Backend**: Django REST Framework (JWT Authentication).
- **Payments**: [Paystack API](https://paystack.com/).
- **Fulfillment**: VTU API Integration.

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended).
- [Firebase CLI](https://firebase.google.com/docs/cli).
- A Paystack account for secret keys.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/wish-app.git
cd wish-app
```

### 2. Configure Firebase
Update the `firebaseConfig` object in `public/js/utils.js` with your project credentials found in the Firebase Console.

### 3. Setup Cloud Functions
Navigate to the functions directory and install dependencies:
```bash
cd functions
npm install
```
Set your environment configurations for Paystack and your VTU provider:
```bash
firebase functions:config:set paystack.key="your_secret_key" vtu.key="your_vtu_api_key"
```

### 4. Local Development
Start the Firebase emulator or use a local live server:
```bash
firebase serve
```

## 📁 Project Structure
- `/public`: Frontend assets (HTML, CSS, JS).
  - `/js`: Modular ES6 scripts (Auth, Wishes, Payments, Utils).
  - `/css`: Custom styles and theme variables.
- `/functions`: Firebase Cloud Functions for backend logic and webhooks.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with 💛 to spread kindness.*