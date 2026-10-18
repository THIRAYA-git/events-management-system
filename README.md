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
| PayHere                   | Sandbox merchant ID and secret (for payment testing)                                                     |
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
2. Sign in with the customer account below. The navbar should show Book a Hall, My Bookings and Dashboard.
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

## 9. Modules

1. **Administration and Analytics:** user and staff management, bookings, reports, analytics dashboard, PDF export.
2. **Event Organizer and Sponsor Connect:** organizer portfolios, event requests, sponsorship offers.
3. **Restaurant and Catering Integration:** menu management and catering orders (Althab Restaurant).
4. **Online Hall Booking Management:** availability calendar, booking workflow, automated pricing, PayHere payment, PDF invoices.

Supporting features: SMS and email notifications, event timeline management, customer feedback, role-based access control.

### Business rules to note during the demo

- Two halls with a combined capacity of 1,200 seats. Bookings that exceed capacity are rejected or flagged.
- Double booking of the same hall at the same date and time is prevented.
- Hall prices by event type: School LKR 20,000, Political LKR 30,000 or 35,000, Birthday LKR 60,000, Wedding LKR 40,000.
- Accommodation: 5 rooms at LKR 5,000 per room per day.

---

## 10. Testing

```bash
cd server
npm test
```

API testing was also done with Postman. Test documentation is included in the project report.

---

## 11. Troubleshooting

| Problem                                           | Fix                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED` or database error on server start  | PostgreSQL is not running, or the credentials in `server/.env` are wrong                                                                  |
| `database "EMS_DB" does not exist`                | Create the database first (Section 4, step 1). The name is case-sensitive                                                                 |
| Port 5000 or 5173 already in use                  | Stop the other process, or change the port in the `.env` or Vite config                                                                   |
| Login fails for demo accounts                     | The backup was not restored. Repeat Section 4                                                                                             |
| Frontend shows a network error                    | The backend is not running, or the client API URL does not point to `http://localhost:5000`                                               |
| Payment completes but the booking stays "pending" | PayHere's server callback cannot reach localhost. This is demonstrated by the student during the viva. All other features work without it |
| Emails, SMS or image uploads do nothing           | The corresponding API keys are not set in `server/.env`                                                                                   |

---
