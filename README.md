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
| Database       | PostgreSQL (database name: `ems_db`)                                                     |
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
| PostgreSQL           | 17 or later (backup created with 18.4) | `psql --version` |
| pgAdmin 4 (optional) | any             | graphical database tool |
| Git                  | any             | `git --version`         |
| ngrok (optional)     | any             | `ngrok version`         |

Use PostgreSQL 17 or later. The backup file is written by PostgreSQL 18.4, and an older `pg_restore` cannot read it.

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
├── ems_db_backup.dump    Database backup (schema and reference data, no bookings)
├── seed_sample_data.sql  Optional sample data for the dashboard demonstration
├── cleanup_for_submission.sql  Removes sample and test data
└── README.md
```

---

## 4. Set Up the Database

1. Open pgAdmin 4 (or `psql`) and create an empty database named **ems_db**.
2. Restore the supplied backup:

```bash
pg_restore -U postgres -d ems_db --no-owner ems_db_backup.dump
```

The backup is a PostgreSQL custom-format archive, so it is restored with `pg_restore`, not `psql`. Use the `pg_restore` that ships with PostgreSQL 17 or later.

The backup contains the full schema and the reference data needed to run the system:

| Data                         | Contents                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| Halls                        | 2 halls, 600 seats each (1,200 combined)                              |
| Rooms                        | 5 accommodation rooms, LKR 5,000 per room per day                     |
| Event pricing                | Price list by event type (Section 10)                                 |
| Restaurant menu              | Althab Restaurant menu items and packages                             |
| Demo accounts                | One account per role (Section 8)                                      |
| Sample partner profiles      | 2 event organizer profiles and 2 sponsor profiles                     |

**The database contains no bookings, payments, room reservations, catering orders, feedback or notifications.** The system starts clean, and all of these are created live during the demonstration (Section 11). The first booking will be numbered 1.

### 4.1 Restore using Windows Command Prompt (cmd)

Open **Command Prompt** (not PowerShell) and run the steps below in order. Copy each block as it is, and change only the three values marked in step 1.

**Step 1: set the PostgreSQL folder, the password and the backup folder**

```cmd
set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=your_postgres_password
cd /d D:\path\to\events-management-system
```

- Change `18` to the installed PostgreSQL version (check `C:\Program Files\PostgreSQL`).
- Change `your_postgres_password` to the password of the `postgres` user. Do not leave a space after it.
- Change the last line to the folder that contains `ems_db_backup.dump`.

**Step 2: create the empty database**

```cmd
"%PGBIN%\createdb.exe" -U postgres ems_db
```

If it answers `database "ems_db" already exists`, remove it and create it again:

```cmd
"%PGBIN%\dropdb.exe" -U postgres ems_db
"%PGBIN%\createdb.exe" -U postgres ems_db
```

**Step 3: restore the backup**

```cmd
"%PGBIN%\pg_restore.exe" -U postgres -d ems_db --no-owner ems_db_backup.dump
```

**Step 4: check the result**

```cmd
"%PGBIN%\psql.exe" -U postgres -d ems_db -c "SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM bookings) AS bookings, (SELECT COUNT(*) FROM halls) AS halls, (SELECT COUNT(*) FROM rooms) AS rooms, (SELECT COUNT(*) FROM event_pricing) AS prices, (SELECT COUNT(*) FROM menu_items) AS menu_items;"
```

Expected result: `users 8`, `bookings 0`, `halls 2`, `rooms 5`, `prices 7`, `menu_items 21`.

**Step 5: point the backend at the database**

In `server/.env` set:

```
DB_MODE=local
LOCAL_DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/ems_db
```

Then continue with Section 5.

If a command answers `password authentication failed`, the password in step 1 is wrong. Repeat step 1 with the correct one.

### 4.1.1 Optional: load sample data for the dashboard demonstration

The restored database has no bookings, so the dashboards start empty. To show how the dashboards, calendar, reports and portals respond to data, load the sample data script. It is optional and can be removed again.

Run from the folder that contains `seed_sample_data.sql`:

```cmd
"%PGBIN%\psql.exe" -U postgres -d ems_db -v ON_ERROR_STOP=1 -f seed_sample_data.sql
```

| Added by the script                  | Quantity                                                             |
| ------------------------------------ | -------------------------------------------------------------------- |
| Bookings                             | 17: 8 completed, 5 confirmed (one is today), 3 pending, 1 cancelled   |
| Hall bookings, payments and invoices | 20 hall rows, 14 payments (12 with invoice numbers)                   |
| Catering orders                      | 10, from the Althab Restaurant menu                                   |
| Other records                        | Event timelines, organizer assignments and checklists, sponsorship requests, 6 feedback entries, 5 room reservations, notifications |
| Sample customers                     | 4, without passwords (they cannot sign in)                            |

- All dates are relative to the day the script is run, so there are always past events for the revenue charts and upcoming events for the schedule.
- The `thirayafathima@gmail.com` demo customer owns several of these bookings, so **My Bookings**, **My Rooms** and **Dashboard** show data after signing in.
- Sample transaction IDs start with `SAMPLE-`. The data is for demonstration only.
- The script stops with an error if the database already contains bookings.

To remove the sample data and return to the empty state, run the cleanup script:

```cmd
"%PGBIN%\psql.exe" -U postgres -d ems_db -v ON_ERROR_STOP=1 -f cleanup_for_submission.sql
```

### 4.2 Create a new backup using Windows Command Prompt (cmd)

Use this to export the current database to `ems_db_backup.dump`:

```cmd
set PGBIN=C:\Program Files\PostgreSQL\18\bin

"%PGBIN%\pg_dump.exe" -U postgres -d ems_db -Fc --no-owner --no-privileges -f ems_db_backup.dump
```

- `-Fc` writes the custom-format archive that `pg_restore` reads.
- The file is saved in the folder where the command is run. To choose the folder, replace the file name with a full path, for example `-f "D:\FYP\EMS\events-management-system\ems_db_backup.dump"`.
- A successful run prints nothing and returns to the prompt. Check the file size afterwards: a database with the reference data and no bookings should produce a file of tens of kilobytes, not a few.

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
| Database                  | Set `DB_MODE=local` and `LOCAL_DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/ems_db` |
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
3. Open **Book a Hall**. The availability calendar should load with every date shown as available, because the database holds no bookings.
4. Open **My Bookings**. It should be empty.

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

These are demo credentials for examination only. They exist in the supplied database backup. New customers can also register from the **Sign in** page.

### 8.1 Reset a demo account password

If a demo account cannot sign in after the restore, generate a new bcrypt hash and write it to the database. Run both steps in Command Prompt, with `PGBIN` and `PGPASSWORD` set as in Section 4.1.

**Step 1: generate the hash** (run inside the `server` folder, where `bcrypt` is installed)

```cmd
cd server
node -e "require('bcrypt').hash('Staff@1234', 10).then(console.log)"
```

Copy the printed hash. It starts with `$2b$10$`. To use another password, replace `Staff@1234` with it.

**Step 2: save the hash and unlock the account**

Replace `<paste hash here>` with the hash from step 1:

```cmd
"%PGBIN%\psql.exe" -U postgres -d ems_db -c "UPDATE users SET password_hash = '<paste hash here>', is_active = true, is_verified = true WHERE role = 'front_desk';"
```

The same statement can be run in the pgAdmin Query Tool:

```sql
UPDATE users
SET password_hash = '<paste hash here>', is_active = true, is_verified = true
WHERE role = 'front_desk';
```

To reset a single account instead of a whole role, replace the last line with `WHERE email = 'staff@aazathplaza.lk';`.

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
- Hall prices by event type: School LKR 20,000, Political LKR 30,000 or 35,000, Birthday LKR 60,000, Wedding LKR 40,000. The admin can change prices from the admin portal.
- Accommodation: 5 rooms at LKR 5,000 per room per day. Rooms can be booked on their own, without a hall booking. Overlapping reservations for the same room are blocked by a database constraint, and an unpaid reservation is released after 15 minutes.

---

## 11. Suggested Demonstration Flow

Because the database starts with no bookings, the demonstration builds the data live:

1. **Customer:** sign in, open **Book a Hall**, pick a date, event type and guest count, and submit. Show the automatic price and the capacity warning above 1,200 guests.
2. **Customer:** optionally add a catering order from Althab Restaurant and a room reservation.
3. **Administrator:** open **Bookings**, approve the booking and assign an event organizer.
4. **Organizer and Sponsor:** show the event request and the sponsorship offer.
5. **Restaurant Partner:** show the catering order received.
6. **Customer:** click **Pay now** and pay with the sandbox card (Section 9.4). Download the PDF invoice.
7. **Administrator:** show the dashboard analytics, scheduled events and PDF report export.

To return to this clean state after practising, restore the database again:

```bash
psql -U postgres -c "DROP DATABASE ems_db;"
psql -U postgres -c "CREATE DATABASE ems_db;"
pg_restore -U postgres -d ems_db --no-owner ems_db_backup.dump
```

---

## 12. Testing

```bash
cd server
npm test
```

API testing was also done with Postman. Test documentation, including test cases and results, is included in the project report (Chapter 6).

---

## 13. Troubleshooting

| Problem                                           | Fix                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` or database error on server start  | PostgreSQL is not running, or the credentials in `server/.env` are wrong                                                                  |
| `database "ems_db" does not exist`                | Create the database first (Section 4, step 1). Use lowercase letters                                                                 |
| `unsupported version (1.16) in file header`       | `pg_restore` is older than PostgreSQL 17. Install PostgreSQL 17 or later                                                                  |
| Port 5000 or 5173 already in use                  | Stop the other process, or change the port in the `.env` or Vite config                                                                   |
| Login fails for demo accounts                     | The backup was not restored (repeat Section 4), or the password needs resetting (Section 8.1)                                             |
| Frontend shows a network error                    | The backend is not running, or the client API URL does not point to `http://localhost:5000`                                               |
| Payment completes but the booking stays "pending" | PayHere's server callback cannot reach localhost. Set `ALLOW_DEV_PAYMENT_CONFIRM=true` and restart the backend (Section 9.2), or use ngrok (Section 9.3) |
| "Payment is not configured"                       | `API_BASE_URL` is missing from `server/.env`. Set it and restart the backend                                                              |
| PayHere popup does not open or the library fails to load | Allow popups, and turn off VPN, ad blocker or tracking protection for the site                                                     |
| ngrok inspector shows no notify request           | The ngrok window was closed, or `API_BASE_URL` does not match the current ngrok address. Update it and restart the backend                  |
| ngrok inspector shows notify with status 400      | The merchant secret in `server/.env` does not match the PayHere sandbox merchant, or the amount differs from the booking                  |
| Emails, SMS or image uploads do nothing           | The corresponding API keys are not set in `server/.env`                                                                                   |

---