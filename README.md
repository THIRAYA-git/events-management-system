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

<img src="docs/screenshots/01-home.png" alt="EMS home page" width="900">

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

### Public Site & Customer Booking

| Home | Availability & Date Selection |
| :---: | :---: |
| <img src="docs/screenshots/01-home.png" width="420"> | <img src="docs/screenshots/04-booking-date-time.png" width="420"> |
| **Hall Selection** | **Event Details & Live Pricing** |
| <img src="docs/screenshots/05-booking-hall.png" width="420"> | <img src="docs/screenshots/06-booking-details.png" width="420"> |
| **Catering – Choose Restaurant** | **Catering – Menu** |
| <img src="docs/screenshots/07-booking-catering-restaurants.png" width="420"> | <img src="docs/screenshots/08-booking-catering-menu.png" width="420"> |
| **Booking Confirmed** | **Payment Portal** |
| <img src="docs/screenshots/09-booking-confirmed.png" width="420"> | <img src="docs/screenshots/10-payment-portal.png" width="420"> |
| **Payment Success & Invoice** | **My Bookings** |
| <img src="docs/screenshots/11-payment-success.png" width="420"> | <img src="docs/screenshots/12-customer-my-bookings.png" width="420"> |

### Administration & Analytics

| Dashboard | Analytics |
| :---: | :---: |
| <img src="docs/screenshots/13-admin-dashboard.png" width="420"> | <img src="docs/screenshots/14-admin-analytics.png" width="420"> |
| **Bookings** | **Event Scheduling** |
| <img src="docs/screenshots/15-admin-bookings.png" width="420"> | <img src="docs/screenshots/16-admin-event-schedule.png" width="420"> |
| **Catering Orders** | **Customer Management** |
| <img src="docs/screenshots/17-admin-catering-orders.png" width="420"> | <img src="docs/screenshots/18-admin-customers.png" width="420"> |
| **Organizer & Sponsor Management** | **Staff Management** |
| <img src="docs/screenshots/19-admin-organizers-sponsors.png" width="420"> | <img src="docs/screenshots/20-admin-staff.png" width="420"> |
| **Customer Feedback** | **Reports** |
| <img src="docs/screenshots/21-admin-feedback.png" width="420"> | <img src="docs/screenshots/22-admin-reports.png" width="420"> |

### Manager & Front Desk

| Manager Dashboard | Front Desk |
| :---: | :---: |
| <img src="docs/screenshots/23-manager-dashboard.png" width="420"> | <img src="docs/screenshots/24-front-desk.png" width="420"> |

### Organizer & Sponsor Connect

| Organizer Dashboard | Event Requests |
| :---: | :---: |
| <img src="docs/screenshots/25-organizer-dashboard.png" width="420"> | <img src="docs/screenshots/26-organizer-requests.png" width="420"> |
| **Organizer Portfolio** | **Sponsor Dashboard** |
| <img src="docs/screenshots/27-organizer-portfolio.png" width="420"> | <img src="docs/screenshots/28-sponsor-dashboard.png" width="420"> |
| **Browse Events (Sponsor)** | **My Sponsorships** |
| <img src="docs/screenshots/29-sponsor-browse-events.png" width="420"> | <img src="docs/screenshots/30-sponsor-my-sponsorships.png" width="420"> |

### Notifications

| Booking Received Email | Payment Received Email |
| :---: | :---: |
| <img src="docs/screenshots/31-email-booking-received.png" width="420"> | <img src="docs/screenshots/32-email-payment-received.png" width="420"> |

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
- PostgreSQL

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

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

<!-- Add your GitHub / LinkedIn / email links here -->
https://www.linkedin.com/in/fathima-thiraya
www.linkedin.com/in/fathima-thiraya
thirayafathima@gmail.com
