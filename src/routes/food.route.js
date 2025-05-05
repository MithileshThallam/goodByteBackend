import express from 'express';
import { donateFood, getAllFood } from '../controllers/food.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router();

// Get all available food (public)
router.get('/all', getAllFood);

// Donate food (authenticated)
router.post('/donate', verifyToken, donateFood);

export default router;
