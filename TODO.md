# WISH Project Roadmap 💛

## 🎨 Frontend Refinements
- [x] Rebrand to "WISH" and implement Glassmorphism design.
- [x] Implement Light/Dark mode toggle.
- [x] Add shimmer loading states for Firestore data.
- [x] **Custom Toasts**: Replace `alert()` in `utils.js` with a non-blocking toast notification system.
- [x] **Form Validation**: Add real-time validation (phone number format, minimum amounts) in `create-wish.html`.
- [x] **Refined UI**: Implemented enhanced Empty States and dynamic Dashboard statistics.
- [x] **Seasonal Themes**: Added detection logic for Valentine, New Year, and special occasions.
- [x] **Countdown Timer**: Implemented hero section timer for upcoming seasons.
- [x] **Confetti**: Trigger celebration on 100% wish fulfillment.

## 🛡️ Security & Infrastructure
- [ ] **Django API Design**: Finalize REST endpoints for Wishes, Profiles, and Transactions.
- [ ] **JWT Auth**: Implement secure token-based authentication (DRF SimpleJWT).
- [x] **Local Dev Bypass**: Frontend simulation mode active for testing UI/UX without a live backend.
- [ ] **Slug System**: Implement a slug-based URL system (e.g., /wish/quiet-yellow-sun) to replace raw Firestore IDs for enhanced anonymity.

## 🔗 API Endpoint Map (For Partner)
- `POST /api/token/` -> `{ email, password }` returns `{ access, refresh }`
- `POST /api/register/` -> `{ email, password }`
- `GET  /api/wishes/` -> Returns array of all open wishes
- `POST /api/wishes/` -> `{ type, network, category, total_amount, phone, message }`
- `GET  /api/wishes/mine/` -> Returns array of wishes owned by current user
- `GET  /api/wishes/allowance/` -> Returns `{ remaining: number }`
- `POST /api/payments/initialize/` -> `{ wish_id, amount }` returns `{ authorization_url }`

## 💡 Technical Notes for Partner (Backend Requirements)
> *Crucial logic implemented in frontend that needs backend parity:*
- **Rolling Weekly Limit**: Django must enforce the **₦5,000 weekly limit** per user in the `Wish` model's save method or serializer validation.
- **CORS Policy**: Enable `django-cors-headers` to allow the frontend to communicate with the API during development.
- **Field Naming**: Use `total_amount` for the wish goal and `amount_paid` for current progress to match frontend templates.

## 💳 Payments & Fulfillment (Django Integration)
- [ ] **Paystack Integration**: Initialize transactions and handle verification via server-side requests.
- [ ] **Shago VTU Provider**:
    - [ ] Securely store Shago API keys in `.env` or Django Secrets.
    - [ ] Map frontend types (`AIRTIME`, `DATA`) to Shago service codes.
    - [ ] Implement error handling for "Provider Down" scenarios to allow for automatic retries.

## 📈 Launch Prep
- [ ] **Domain Setup**: Point `wish-app.web.app` to a custom domain.
- [ ] **SEO**: Final audit of meta tags in `index.html`.
- [ ] **Analytics**: Integrate Google Analytics or a Django-compatible tracking tool.

---
*Built with 💛 to spread kindness.*
