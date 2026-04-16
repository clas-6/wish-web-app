# WISH Project Roadmap 💛

## 🎨 Frontend Refinements (UI/UX)
- [x] Rebrand to "WISH" and implement Glassmorphism design.
- [x] Implement Light/Dark mode toggle.
- [x] Add shimmer loading states for Firestore data.
- [x] **Custom Toasts**: Replace `alert()` in `utils.js` with a non-blocking toast notification system.
- [ ] **Form Validation**: Add real-time validation (phone number format, minimum amounts) in `create-wish.html`.
- [x] **Empty States**: Design better "No wishes found" graphics for the Browse and Dashboard pages.
- [ ] **Confetti**: Trigger celebration on 100% wish fulfillment.

## 🛡️ Security & Infrastructure
- [x] **Firestore Rules**: Complete and deploy the `firestore.rules` (ensure `amount_paid` is read-only for users).
- [ ] **Firebase Secrets**: Move Paystack/VTU keys from `functions/index.js` to Google Cloud Secret Manager.
- [ ] **Environment Check**: Ensure `seed-data.js` and local simulation bypasses in `payments.js` are disabled in production.
- [ ] **Slug System**: Implement a slug-based URL system (e.g., /wish/quiet-yellow-sun) to replace raw Firestore IDs for enhanced anonymity.
- [ ] **Index Optimization**: Create Firestore composite indexes for queries (e.g., filtering by type + status).

## 💡 Technical Notes for Partner (Backend Requirements)
> *Crucial logic implemented in frontend that needs backend parity:*
- **Rolling Weekly Limit**: Frontend enforces a **₦5,000 limit** based on a rolling 7-day window. Partner must implement a `beforeCreate` Cloud Function or a `checkLimit` Callable to prevent API-level bypass.
- **Firestore Indexing**: The "Weekly Allowance" display requires a composite index on `wishes` for the fields: `uid (Ascending)` + `created_at (Descending)`.
- **Validation Parity**: Ensure the backend validates the Nigerian phone number format (`^0[789][01]\d{8}$`) and the minimum wish amount (₦100) before processing.
- **Slug Generation**: When a wish is created, the backend should generate a unique, human-readable slug to be used for the public URL.

## � Payments & Fulfillment (Partner's Part)
- [ ] **Paystack Webhook**: Finalize the `paystackWebhook` in Cloud Functions.
    - [ ] Implement idempotency (check `processed_references`) to prevent double-crediting.
    - [ ] Log every raw webhook event to a `webhook_logs` collection for debugging.
- [ ] **VTU Integration**:
    - [ ] Map `type` and `network` to real provider API service IDs.
    - [ ] Implement a retry queue for failed VTU attempts.
    - [ ] Add a `vtu_logs` sub-collection to each wish for transparency.

## 📈 Launch Prep
- [ ] **Domain Setup**: Point `wish-app.web.app` to a custom domain.
- [ ] **SEO**: Final audit of meta tags in `index.html`.
- [ ] **Analytics**: Integrate Firebase Analytics to track "Kindness Given" vs "Wishes Made."

---
*Built with 💛 to spread kindness.*
