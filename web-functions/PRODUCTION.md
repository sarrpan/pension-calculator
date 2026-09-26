# Public premium and contact flows

This change prepares code and rules; it does not deploy them or configure credentials.

## Environment

Vercel / frontend build:

| Variable | Value |
| --- | --- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for the intended environment; production must use the matching live account. |
| `VITE_CONTACT_URL` | HTTPS URL of `sendContactMessage`. |
| `VITE_CONTACT_EMAIL` | Optional public contact address. Leave unset to hide the direct-email card. |
| `VITE_SYMPLIROSI_AITISIS_URL` | Existing `symplirosiAitisis` URL. The updated function now also creates new requests. |
| `VITE_GET_REQUEST_STATUS_URL` | Existing `getRequestStatus` URL. |
| `VITE_REQUEST_WITHDRAWAL_URL` | HTTPS URL of the new `requestWithdrawal` function. |
| `VITE_CREATE_PAYMENT_INTENT_URL` | Existing `createPaymentIntent` URL. |
| `VITE_EPIVEVAIOSI_PLIROMIS_URL` | Existing `epivevaiosiPliromis` URL. |

Firebase Functions:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_URL` | Actual public HTTPS site origin. No assumed production domain. Required before premium status emails can be sent. |
| `CONTACT_EMAIL` | Contact recipient; falls back to `EMAIL_USER`. Neither value is automatically published. |
| `EMAIL_USER`, `EMAIL_PASS` | Existing Gmail/Nodemailer credentials. |
| `STRIPE_SECRET_KEY` | Existing server Stripe key matching the frontend account/environment. Never expose it in a `VITE_` variable. |
| `ADMIN_EMAIL_KODIKOS` | Existing server credential used for status changes and premium emails. |

## Firebase access

- Enable the existing Anonymous Auth provider for document uploads. `initAuth()` is called only by upload services.
- Assign `admin: true` as a **custom claim using the trusted Admin SDK** to the intended administrator account, then sign in again/refresh its ID token. Ordinary authenticated accounts are not administrators. See [Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims).
- `storage.rules` denies public reads, rejects unsupported/oversized files and overwrites, and permits cleanup only by the uploading UID or an administrator. Administrators can access documents and publish final PDF reports using the existing dashboard.
- `database.rules.json` protects `premium_requests`; public clients use the HTTP functions instead of database reads/writes. No access is granted to other database paths. This repository's current public calculator does not use database profile storage. Before applying the rules to a shared database, preserve any separately managed rules for other applications rather than overwriting them.
- Both Firebase configuration files reference these rules. Functions and rules must be released together before the updated frontend. No deployment was performed for this task.

Uploads retain the existing `premium_uploads/PIN-xxxxxx/...` path structure. Server verification reads object metadata and applies cumulative limits in a transaction. Supplementary documents are accepted while a request is `documents_received` or `needs_more_info`; later stages require contacting the service so that an already reviewed/paid request cannot be reset by an upload.

No email is sent automatically when the initial upload completes. The PIN is displayed on screen. Existing administrator-triggered status emails remain in place. Contact messages use the new explicit form endpoint, with no attachments.

Payment is 2000 euro cents with automatic capture, only after the server confirms `awaiting_payment` and an unpaid request. Repeated creation reuses the request's PaymentIntent. Confirmation accepts only a verified `succeeded` payment and is idempotent, preserving later statuses.

## Withdrawal and manual refunds

`requestWithdrawal` accepts the request PIN/email, required `fullName` (2–200 characters),
and `confirmed: true`. The name is kept only in `withdrawalDeclaration`, with the PIN/email,
service and contract date, alongside the withdrawal timestamp. Paid, undelivered
requests move atomically to `withdrawn`, with `withdrawalStatus: requested`, the submission
timestamp, prior status, original PaymentIntent ID, and `refundStatus: pending`.
Before recording a new withdrawal, the server retrieves the request's stored PaymentIntent
and verifies its identity, succeeded status, and matching PIN/email metadata.
`refundAmount` comes from its `amount_received` (Stripe minor units), and `refundCurrency`
from its `currency`, without fee deductions. This also covers older paid requests with no
stored amount and does not depend on the current catalogue price. Browser-supplied amounts,
currencies and PaymentIntent IDs are ignored. Before-delivery requests
are accepted without an additional date cutoff. Delivered requests go through contact instead.
Normal status transitions, delivery, supplementary uploads and new payments are blocked after withdrawal.

In the admin dashboard, perform the full refund manually in Stripe Dashboard using the
displayed PaymentIntent ID, then choose “Σήμανση επιστροφής ως ολοκληρωμένης”. This calls
the existing admin function with `energeia: refund_completed` and the admin header; it only
sets `refundStatus: completed` and `refundedAt`. Repeating it preserves the original timestamp.
No Stripe Refund API is called and no refund-completion email is sent automatically.

The withdrawal acknowledgement email is claimed atomically with the request. Retries and
concurrent requests do not send it twice. SMTP failures leave the withdrawal/refund pending
and are flagged in the admin dashboard. Ambiguous failures are not automatically retried:
the operator must check delivery manually. There is no claim of exactly-once SMTP delivery.

Release the changed functions before the frontend and configure `VITE_REQUEST_WITHDRAWAL_URL`.
This task does not perform deployment or configure production settings.

## Checks

From the repository root:

```text
npm run build
node --check web-functions/index.js
node --test web-functions/publicFlows.test.cjs web-functions/clientFlows.test.cjs web-functions/adminVerification.test.cjs
```

The tests stub Stripe and SMTP; they do not charge cards or send real messages.

For `storageRules.test.cjs`, start Auth, Storage and Database emulators with project `demo-premium-flows` and the rules in this directory. Set `FIREBASE_AUTH_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST` and `FIREBASE_DATABASE_EMULATOR_HOST` to their localhost addresses, then run:

```text
node --test --test-force-exit web-functions/storageRules.test.cjs
```

Without those variables the emulator test is skipped. Its fixtures use the demo project's `demo-premium-flows-default-rtdb` namespace; it must never target a live database.
