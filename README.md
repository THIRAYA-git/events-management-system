# Events Management System for Aazath Plaza Reception Hall

MIT 32046 – Software Development Project
South Eastern University of Sri Lanka, Department of Management and Information Technology
Student: R. Fathima Thiraya (SEU/IS/21/MIT/066)

A full-stack web application for online hall booking, event coordination, catering, payments and business analytics at Aazath Plaza Reception Hall.

---

## 1. Technology Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Frontend       | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Chart.js              |
| Backend        | Node.js, Express                                                        |
| Database       | PostgreSQL (database name: `ems_db`)                                    |
| Authentication | JWT, bcrypt, role-based access control                                  |
| Integrations   | PayHere sandbox (payments), SendGrid (email), text.lk (SMS), Cloudinary (images) |

Default ports: backend `http://localhost:5000`, frontend `http://localhost:5173`.

---

## 2. Prerequisites

- Node.js 20 LTS or later, with npm
- PostgreSQL 17 or later (the database was exported from PostgreSQL 18.4)
- pgAdmin 4
- A current Chrome, Firefox or Edge browser

---

## 3. Set Up the Database

1. Open pgAdmin 4 and create an empty database named `ems_db`.
2. Right-click `ems_db`, choose **Restore**, select the database backup file supplied with this submission, and click **Restore**.
3. Refresh the database and confirm the tables are present.

The restored database holds the schema and the reference data (halls, rooms, event prices, Althab Restaurant menu, demo accounts, sample organizer and sponsor profiles). It contains no bookings, so bookings are created live during the demonstration.

---

## 4. Start the Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Edit `server/.env` before starting. The values to set:

| Setting                   | Value                                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| `DB_MODE`                 | `local`                                                                |
| `LOCAL_DATABASE_URL`      | `postgresql://postgres:<your_password>@localhost:5432/ems_db`          |
| JWT secrets               | Any long random strings (access and refresh tokens)                    |
| Client URL                | `http://localhost:5173`                                                |
| `API_BASE_URL`            | `http://localhost:5000`                                                |
| `ALLOW_DEV_PAYMENT_CONFIRM` | `true` for local testing                                             |
| PayHere, SendGrid, SMS, Cloudinary keys | Optional. Without them the system still runs, but online payment, email, SMS and image upload are unavailable. |

The backend is ready when the terminal shows it is listening on port 5000.

---

## 5. Start the Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in the browser.

---

## 6. Demo Accounts

| Role                 | Email                      | Password         | Portal                          |
| -------------------- | -------------------------- | ---------------- | ------------------------------- |
| System Administrator | `admin@aazathplaza.lk`     | `NewAdmin@123`   | `/admin`                        |
| Front Desk Staff     | `staff@aazathplaza.lk`     | `Staff@1234`     | `/admin`                        |
| Customer             | `test@example.com`         | `test@123`       | `/book`, `/my-bookings`         |
| Event Organizer      | `fathima@decorations.lk`   | `Organizer@1234` | `/organizer`                    |
| Sponsor              | `sponsor@akbartraders.lk`  | `Sponsor@123`    | `/sponsor`                      |
| Restaurant Partner   | `althab@restaurant.lk`     | `Restaurant@123` | `/restaurant`                   |

These credentials are for examination only. New customers can also register from the **Sign in** page.

---

## 7. Modules

1. **Administration and Analytics:** user and staff management, bookings, reports, analytics dashboard, PDF export.
2. **Event Organizer and Sponsor Connect:** organizer portfolios, event requests, sponsorship offers.
3. **Restaurant and Catering Integration:** menu management and catering orders (Althab Restaurant).
4. **Online Hall Booking Management:** availability calendar, booking workflow, automated pricing, payment, PDF invoices.

Supporting features: SMS and email notifications, event timeline management, customer feedback, role-based access control.

### Business rules

- Two halls of 600 seats each (1,200 combined). Bookings that exceed capacity are rejected or flagged.
- Double booking of the same hall on the same date and time is prevented.
- Hall prices by event type: School LKR 20,000; Political LKR 30,000 or 35,000; Birthday LKR 60,000; Wedding LKR 40,000; Walima LKR 40,000 (one hall) or LKR 60,000 (both halls). The administrator can change prices from the admin portal.
- Accommodation: 5 rooms at LKR 5,000 per room per day. Rooms can be booked without a hall booking.

---

## 8. Demonstration Flow

1. **Customer:** sign in, open **Book a Hall**, choose a date, event type and guest count, and submit. Show the automatic price and the capacity warning.
2. **Customer:** optionally add a catering order and a room reservation.
3. **Administrator or front desk:** approve the booking and assign an event organizer.
4. **Organizer, sponsor and restaurant:** show the event request, sponsorship offer and catering order.
5. **Payment:** pay online with the PayHere sandbox card, or record a cash payment from the **Bookings** page, then download the PDF invoice.
6. **Administrator:** show the dashboard analytics, scheduled events and PDF report export.

PayHere sandbox test card: Visa `4916217501611292`, any future expiry (for example `12/30`), any 3-digit CVV, any cardholder name. No real money is charged.

---

## 9. Testing

```bash
cd server
npm test
```

API testing was also done with Postman. Test cases and results are in Chapter 6 of the project report.

---

## 10. Troubleshooting

| Problem                                   | Fix                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------- |
| Database error on server start            | PostgreSQL is not running, or the credentials in `server/.env` are wrong. |
| Login fails for demo accounts             | The database was not restored (repeat Section 3).                   |
| Frontend shows a network error            | The backend is not running, or the client API URL is not `http://localhost:5000`. |
| Port 5000 or 5173 already in use          | Stop the other process, or change the port in `.env` or the Vite config. |
| Online payment stays "pending"            | Set `ALLOW_DEV_PAYMENT_CONFIRM=true` and restart the backend, or use the cash payment option. |
| Emails, SMS or image uploads do nothing   | The corresponding API keys are not set in `server/.env`.            |