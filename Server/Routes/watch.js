import express from 'express';
import auth from '../middleware/auth.js';
import { watchVideoController } from '../Controllers/watchController.js';

const router = express.Router();

// 🎬 Validates watch time limit based on user plan
router.post('/validate', auth, watchVideoController); // POST /api/watch/validate

export default router;
