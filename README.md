# Events Management System (EMS) - Aazath Plaza

A full-stack events management system built with React, TypeScript, and Node.js.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Recharts
- React Big Calendar

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Cloudinary (Media)
- Nodemailer (Email)
- Text.LK (SMS)
- PDFKit (Reports)

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
Copy `.env.example` files and configure:

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
