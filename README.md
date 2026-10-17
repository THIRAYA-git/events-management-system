<div align="center">

# Events Management System (EMS) – Aazath Plaza

**A full-stack, role-based web platform that digitises hall booking, catering, event coordination and business analytics for Aazath Plaza Reception Hall, Sri Lanka.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

Final Year Project · MIT 32046 Software Development Project · Department of Management and Information Technology, South Eastern University of Sri Lanka

<!-- Add once available: [Live Demo](https://your-demo-url) · [Project Report](link) · [Demo Video](link) -->

<img src="docs/screenshots/01-home-light.jpg" alt="EMS home page" width="900">

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Author](#author)

---

## Overview

Aazath Plaza Reception Hall (est. 2016) ran on phone calls and paper registers. Customers could not see availability, bookings could exceed the 1,200-seat combined capacity of its two halls, and there was no audit trail for payments.

EMS replaces that with a single integrated platform built around four modules:

| Module | Purpose |
| --- | --- |
| **1. Administration & Analytics** | Back-office management, reports, staff and customer records, revenue and utilisation dashboards |
| **2. Event Organizer & Sponsor Connect** | Organizers publish portfolios and receive event requests; sponsors browse events and send offers |
| **3. Restaurant & Catering Integration** | Partner restaurants publish menus; customers add catering during booking |
| **4. Online Hall Booking** | Real-time availability, multi-step booking wizard, automated pricing, payment and invoicing |

## Key Features

- **Real-time availability calendar** showing free, partially booked and fully booked days across both halls
- **Multi-step booking wizard**: date and time → hall → event details → catering → review and confirmation
- **Double-booking and capacity protection** that blocks conflicting bookings and over-capacity guest counts
- **Automated pricing** by event type plus accommodation room charges, shown live as the customer chooses
- **Online payment and PDF invoices** generated automatically after payment
- **Email and SMS notifications** for booking, payment and status updates
- **Restaurant and catering ordering** linked to each booking
- **Organizer and sponsor marketplace** with portfolios, event requests and sponsorship tracking
- **Event timeline scheduling** for setup, decoration, catering and cleanup tasks
- **Analytics dashboard** with revenue trends, hall utilisation, booking status and event-type breakdowns
- **Report generation and export** to PDF
- **Customer feedback and reviews** surfaced on the public site
- **Light and dark themes** across the public site and all dashboards
- **JWT authentication with role-based access control** across seven roles

## User Roles

| Role | What they do |
| --- | --- |
| **Customer** | Check availability, book halls and rooms, add catering, pay, track bookings, leave feedback |
| **Front Desk Staff** | Handle walk-in bookings, view schedules, process payments |
| **Manager** | Approve bookings, view analytics and reports |
| **Administrator** | Full system access: staff, customers, partners, reports, settings |
| **Event Organizer** | Maintain a portfolio, accept or decline event requests |
| **Sponsor** | Browse upcoming events, send and track sponsorship offers |
| **Restaurant Partner** | Manage menus and receive catering orders |

## Screenshots

### Public Site & Account

| **Home (Light)** | **Home (Dark)** |
| :---: | :---: |
| <img src="docs/screenshots/01-home-light.jpg" width="420"> | <img src="docs/screenshots/02-home-dark.jpg" width="420"> |
| **About** | **Contact** |
| <img src="docs/screenshots/03-about.jpg" width="420"> | <img src="docs/screenshots/04-contact.jpg" width="420"> |
| **Login** |  |
| <img src="docs/screenshots/05-login.jpg" width="420"> |  |

### Customer Booking & Account

| **Booking Wizard – Date & Time** | **Booking Wizard – Catering Category** |
| :---: | :---: |
| <img src="docs/screenshots/06-booking-date-time.jpg" width="420"> | <img src="docs/screenshots/07-booking-catering-category.jpg" width="420"> |
| **Booking Wizard – Catering Items** | **Booking Review** |
| <img src="docs/screenshots/08-booking-catering-items.jpg" width="420"> | <img src="docs/screenshots/09-booking-review.png" width="420"> |
| **Booking Confirmed** | **Customer Dashboard** |
| <img src="docs/screenshots/10-booking-confirmed.png" width="420"> | <img src="docs/screenshots/11-customer-dashboard.jpg" width="420"> |
| **My Bookings** | **Profile Settings** |
| <img src="docs/screenshots/12-my-bookings.jpg" width="420"> | <img src="docs/screenshots/13-profile-settings.png" width="420"> |

### Administration & Analytics

| **Dashboard** | **Collapsed Sidebar** |
| :---: | :---: |
| <img src="docs/screenshots/14-admin-dashboard.jpg" width="420"> | <img src="docs/screenshots/15-admin-collapsed-sidebar.jpg" width="420"> |
| **Bookings** | **Catering Orders** |
| <img src="docs/screenshots/16-admin-bookings.png" width="420"> | <img src="docs/screenshots/17-admin-catering-orders.png" width="420"> |
| **Analytics** | **Reports** |
| <img src="docs/screenshots/18-admin-analytics.jpg" width="420"> | <img src="docs/screenshots/19-admin-reports.jpg" width="420"> |
| **Staff Management** | **Organizers & Sponsors** |
| <img src="docs/screenshots/20-admin-staff.png" width="420"> | <img src="docs/screenshots/21-admin-organizers-sponsors.png" width="420"> |
| **Customer Feedback** |  |
| <img src="docs/screenshots/22-admin-feedback.png" width="420"> |  |

### Manager & Front Desk

| **Manager Dashboard** | **Customer Management** |
| :---: | :---: |
| <img src="docs/screenshots/23-manager-dashboard.png" width="420"> | <img src="docs/screenshots/24-manager-customers.png" width="420"> |
| **Front Desk Dashboard** | **Event Scheduling** |
| <img src="docs/screenshots/25-front-desk-dashboard.jpg" width="420"> | <img src="docs/screenshots/26-front-desk-schedule.png" width="420"> |
| **Add Activity** |  |
| <img src="docs/screenshots/27-front-desk-add-activity.png" width="420"> |  |

### Organizer & Sponsor Connect

| **Organizer Dashboard** | **Organizer Portfolio** |
| :---: | :---: |
| <img src="docs/screenshots/28-organizer-dashboard.png" width="420"> | <img src="docs/screenshots/29-organizer-portfolio.png" width="420"> |
| **Sponsor Dashboard** | **Sponsor Offering** |
| <img src="docs/screenshots/30-sponsor-dashboard.png" width="420"> | <img src="docs/screenshots/31-sponsor-offering.png" width="420"> |
| **Sponsorships** |  |
| <img src="docs/screenshots/32-sponsor-sponsorships.png" width="420"> |  |

### Restaurant & Catering

| **Restaurant Dashboard** | **Menu Items** |
| :---: | :---: |
| <img src="docs/screenshots/33-restaurant-dashboard.png" width="420"> | <img src="docs/screenshots/34-restaurant-menu-items.png" width="420"> |

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Recharts (analytics charts)
- React Big Calendar (availability and scheduling)

### Backend
- Node.js + Express
- PostgreSQL
- JWT authentication with role-based access control
- Cloudinary (media uploads)
- Nodemailer (email)
- Text.LK (SMS)
- PDFKit (invoices and reports)

### Architecture
Three-tier architecture: React single-page client → Express REST API → PostgreSQL. Developed using a Waterfall methodology with iterative client feedback.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (run the db file in query tool)

### Installation

```bash
# Install server dependencies
cd server
npm install (run on cmd)

# Install client dependencies
cd ../client
npm install
```

### Environment Variables
Copy the .env.example file and fill in your values:
Rename the server/.env.example to server/.env

### ngrok Download, install & VS Code extension to run.
1. Go to this link "https://ngrok.com/download/windows?tab=download"

2. sign up & get Auth Token from dashboard.

3. ngrok for VSCode by Phill Nash

4. Press Ctrl + Shift + P (or F1) on your keyboard to open the VS Code Command Palette dropdown at the top of your editor.

5. Type ngrok set auth token & paste the token.
ngrok: start inside that top search bar.

6. Press Enter Type ngrok: start. 

Why it is needed: Malicious actors frequently use free TCP tunnels to launch malware and phishing campaigns anonymously. Ngrok requires a valid debit or credit card purely as an identity check to stop automated bots. As long as you stay within free limits, it costs $0.

### Running the App

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

## Project Structure

```
.
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Express API, database access, integrations
└── docs/
    └── screenshots/ # Images used in this README
```

## Author

**R. Fathima Thiraya**
Final Year Project, Department of Management and Information Technology, Faculty of Management and Commerce, South Eastern University of Sri Lanka.

[LinkedIn](https://www.linkedin.com/in/fathima-thiraya) · [Email](mailto:thirayafathima@gmail.com)
