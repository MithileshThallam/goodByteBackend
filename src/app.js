import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import foodRoutes from './routes/food.route.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.json({ message: 'This is the /index route from Express!' });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
