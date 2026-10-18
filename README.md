# Events Management System for Aazath Plaza Reception Hall

MIT 32046 – Software Development Project
South Eastern University of Sri Lanka, Department of Management and Information Technology
Student: R. Fathima Thiraya (SEU/IS/21/MIT/066)

A full-stack web application for online hall booking, event coordination, catering, payments and business analytics at Aazath Plaza Reception Hall.

This README is the setup guide. Follow the steps in order to run the system from scratch.

---

## 1. Technology Stack

| Layer          | Technology                                                                               |
| -------------- | ---------------------------------------------------------------------------------------- |
| Frontend       | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Chart.js                            |
| Backend        | Node.js, Express (CommonJS)                                                              |
| Database       | PostgreSQL (database name: `EMS_DB`)                                                     |
| Authentication | JWT (access token + refresh token cookie), bcrypt, role-based access control             |
| Integrations   | PayHere sandbox (payments), SendGrid (email), SMS gateway (text.lk), Cloudinary (images) |

Default ports: backend `http://localhost:5000`, frontend `http://localhost:5173`.

---

## 2. Prerequisites

Install these before starting:

| Tool                 | Version         | Check with              |
| -------------------- | --------------- | ----------------------- |
| Node.js              | 20 LTS or later | `node -v`               |
| npm                  | 10 or later     | `npm -v`                |
| PostgreSQL           | 15 or later     | `psql --version`        |
| pgAdmin 4 (optional) | any             | graphical database tool |
| Git                  | any             | `git --version`         |
| ngrok (optional)     | any             | `ngrok version`         |

ngrok is only needed to test PayHere's real server callback (Section 9.3). It is not required to run or demonstrate the system.

---

## 3. Get the Code

```bash
git clone https://github.com/THIRAYA-git/events-management-system.git
cd events-management-system
```

Project structure:

```
events-management-system/
├── client/               React frontend
├── server/               Express backend
├── EMS_DB_backup.sql     Full database backup (schema and demo data)
└── README.md
```

---

## 4. Set Up the Database

1. Open pgAdmin 4 (or `psql`) and create an empty database named **EMS_DB**.
2. Restore the supplied backup:

```bash
psql -U postgres -d EMS_DB -f EMS_DB_backup.sql
```

The backup contains the full schema and the demo data, including the accounts in Section 8.

---

## 5. Configure and Start the Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in the values. Every variable is listed in `.env.example`. At a minimum:

| Setting                   | What to provide                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Database                  | Set `DB_MODE=local` and `LOCAL_DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/EMS_DB` |
| JWT secrets               | Any long random strings for the access and refresh tokens                                                |
| Client URL                | `http://localhost:5173`                                                                                  |
| PayHere                   | Sandbox merchant ID and secret (supplied with the submission). See Section 9                             |
| `ALLOW_DEV_PAYMENT_CONFIRM` | `true` for local testing (Section 9.2). Must be absent or `false` in production                        |
| `API_BASE_URL`            | `http://localhost:5000` by default. Replace with the ngrok URL only for the full callback test (Section 9.3) |
| SendGrid, SMS, Cloudinary | API keys. Optional: without them, the system still runs but email, SMS and image upload will not work    |

Start the server:

```bash
npm run dev
```

The backend is ready when the terminal shows it is listening on port 5000.

---

## 6. Configure and Start the Frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env     # only if client/.env.example exists
npm run dev
```

Open **http://localhost:5173** in Chrome, Firefox or Edge.

---

## 7. Quick Verification

1. The home page loads at `http://localhost:5173` with Home, About, Contact and a **Sign in** button.
2. Sign in with the customer account below. The navbar should show Book a Hall, Book a Room, My Bookings, My Rooms and Dashboard.
3. Open **Book a Hall**. The availability calendar should load.

If the calendar or login fails, check that the backend terminal shows no database connection error.

---

## 8. Demo Accounts

Use these accounts to demonstrate each role.

| Role                 | Email                      | Password         | Portal                                |
| -------------------- | -------------------------- | ---------------- | ------------------------------------- |
| System Administrator | `admin@aazathplaza.lk`     | `NewAdmin@123`   | `/admin`                              |
| Front Desk Staff     | `staff@aazathplaza.lk`     | `Staff@1234`     | `/admin`                              |
| Customer             | `thirayafathima@gmail.com` | `customer@123`   | `/book`, `/my-bookings`, `/dashboard` |
| Event Organizer      | `fathima@decorations.lk`   | `Organizer@1234` | `/organizer`                          |
| Sponsor              | `sponsor@akbartraders.lk`  | `Sponsor@123`    | `/sponsor`                            |
| Restaurant Partner   | `althab@restaurant.lk`     | `Restaurant@123` | `/restaurant`                         |

These are demo credentials for examination only. They exist in the supplied database backup.

---

## 9. Payments (PayHere Sandbox)

Hall bookings and room reservations are paid through the PayHere sandbox gateway. No real money is charged.

### 9.1 How payment confirmation works

1. The customer clicks **Pay now**. The backend creates a signed checkout request and the PayHere popup opens.
2. The customer pays in the popup.
3. PayHere then sends a server-to-server **notify** request to the backend (`POST /api/payments/notify` for halls, `POST /api/rooms/payments/notify` for rooms). The backend verifies the signature and amount, confirms the booking, issues the invoice and sends the email and SMS.

Step 3 requires a URL that PayHere's servers can reach. A local `http://localhost:5000` is not reachable from the internet, so there are two ways to run the system.

### 9.2 Option A: Local testing without ngrok (default)

Set this in `server/.env`:

```
ALLOW_DEV_PAYMENT_CONFIRM=true
```

When the popup reports a successful payment and the notify callback has not arrived, the checkout page asks the backend to confirm the payment. The backend then runs the same confirmation logic as the real webhook (booking confirmed, invoice number issued, email and SMS sent).

- This is a testing aid for machines that PayHere cannot reach.
- It is refused with a 404 when the setting is not `true` or when `NODE_ENV=production`.
- In production the signature-verified notify endpoint is the only way a payment is confirmed.

### 9.3 Option B: Full callback test with ngrok

Use this to see PayHere's real notify request reach the backend.

1. **Install ngrok** from https://ngrok.com/download (on Windows: `winget install ngrok.ngrok`).
2. **Create a free ngrok account** and copy your authtoken from the dashboard, then register it once:

   ```bash
   ngrok config add-authtoken <your_authtoken>
   ```

3. **Start the backend** (`npm run dev` in `server`), then open a new terminal and expose port 5000:

   ```bash
   ngrok http 5000
   ```

   ngrok prints a public address like `https://<your-subdomain>.ngrok-free.dev`. Copy it.

   Free accounts also get one fixed domain, so the address does not change between runs:

   ```bash
   ngrok http --url=<your-fixed-domain> 5000
   ```

4. **Set the public URL** in `server/.env` (no trailing slash):

   ```
   API_BASE_URL=https://<your-subdomain>.ngrok-free.dev
   ```

   The backend builds the notify addresses from this value:

   - Halls: `API_BASE_URL/api/payments/notify`
   - Rooms: `API_BASE_URL/api/rooms/payments/notify`

5. **Restart the backend** (type `rs` in the nodemon terminal). Changes to `.env` are not picked up automatically.
6. **Make a payment** (Section 9.4) and watch the ngrok inspector at http://127.0.0.1:4040. A `POST` to `/api/payments/notify` (or `/api/rooms/payments/notify`) with status **200** means PayHere's callback reached the backend.

Notes:

- The ngrok window must stay open while testing.
- With a random (non-fixed) address, the URL changes every time ngrok restarts, so update `API_BASE_URL` and restart the backend again.
- Keep `ALLOW_DEV_PAYMENT_CONFIRM=true`. The fallback only runs if the real notify has not arrived.

### 9.4 PayHere sandbox test card

Sign in as the customer, create a hall booking or a room reservation, and click **Pay now**. In the PayHere popup choose **Bank Card** and enter:

| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| Card number      | `4916217501611292` (Visa)                          |
| Expiry           | Any future date, for example `12/30`               |
| CVV              | Any 3 digits, for example `123`                    |
| Cardholder name  | Any name, for example `Test Customer`              |

Alternative test card (Mastercard): `5307732125531191`, with the same expiry, CVV and name rules.

PayHere lists further sandbox cards in its developer documentation: https://support.payhere.lk/sandbox-and-testing

After a successful payment:

- **Halls:** the booking changes from *pending* to *confirmed* in **My Bookings** and a PDF invoice can be downloaded.
- **Rooms:** the reservation changes to *confirmed* and *paid* in **My Rooms**.

If the popup does not open, allow popups for `localhost` and turn off any VPN or ad blocker, because the PayHere script loads from `payhere.lk`.

---

## 10. Modules

1. **Administration and Analytics:** user and staff management, bookings, reports, analytics dashboard, PDF export.
2. **Event Organizer and Sponsor Connect:** organizer portfolios, event requests, sponsorship offers.
3. **Restaurant and Catering Integration:** menu management and catering orders (Althab Restaurant).
4. **Online Hall Booking Management:** availability calendar, booking workflow, automated pricing, PayHere payment, PDF invoices.

Supporting features: SMS and email notifications, event timeline management, customer feedback, role-based access control.

### Business rules to note during the demo

- Two halls with a combined capacity of 1,200 seats. Bookings that exceed capacity are rejected or flagged.
- Double booking of the same hall at the same date and time is prevented.
- Hall prices by event type: School LKR 20,000, Political LKR 30,000 or 35,000, Birthday LKR 60,000, Wedding LKR 40,000.
- Accommodation: 5 rooms at LKR 5,000 per room per day. Rooms can be booked on their own, without a hall booking. Overlapping reservations for the same room are blocked by a database constraint, and an unpaid reservation is released after 15 minutes.

---

## 11. Testing

```bash
cd server
npm test
```

API testing was also done with Postman. Test documentation is included in the project report.

---

## 12. Troubleshooting

| Problem                                           | Fix                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` or database error on server start  | PostgreSQL is not running, or the credentials in `server/.env` are wrong                                                                  |
| `database "EMS_DB" does not exist`                | Create the database first (Section 4, step 1). The name is case-sensitive                                                                 |
| Port 5000 or 5173 already in use                  | Stop the other process, or change the port in the `.env` or Vite config                                                                   |
| Login fails for demo accounts                     | The backup was not restored. Repeat Section 4                                                                                             |
| Frontend shows a network error                    | The backend is not running, or the client API URL does not point to `http://localhost:5000`                                               |
| Payment completes but the booking stays "pending" | PayHere's server callback cannot reach localhost. Set `ALLOW_DEV_PAYMENT_CONFIRM=true` and restart the backend (Section 9.2), or use ngrok (Section 9.3) |
| "Payment is not configured"                       | `API_BASE_URL` is missing from `server/.env`. Set it and restart the backend                                                              |
| PayHere popup does not open or the library fails to load | Allow popups, and turn off VPN, ad blocker or tracking protection for the site                                                     |
| ngrok inspector shows no notify request           | The ngrok window was closed, or `API_BASE_URL` does not match the current ngrok address. Update it and restart the backend                  |
| ngrok inspector shows notify with status 400      | The merchant secret in `server/.env` does not match the PayHere sandbox merchant, or the amount differs from the booking                  |
| Emails, SMS or image uploads do nothing           | The corresponding API keys are not set in `server/.env`                                                                                   |

---