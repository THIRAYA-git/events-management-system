const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./config/db');

app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as server_time');
    res.json({
      message: '✅ EMS API is running',
      project: 'Events Management System for Aazath Plaza Reception Hall',
      database: '✅ PostgreSQL Connected',
      server_time: result.rows[0].server_time
    });
  } catch (err) {
    res.status(500).json({ error: '❌ DB connection failed', details: err.message });
  }
});

const start = async () => {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();