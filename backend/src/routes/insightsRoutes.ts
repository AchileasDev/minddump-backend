import express from 'express';
import { analyzeDump } from '../controllers/insightsController';
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/insights/analyze-dump
router.post('/analyze-dump', auth, analyzeDump);

export default router;