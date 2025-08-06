import express from 'express';
import { getQuestionsController, saveAnswerController, getUserAnswersController } from '../controllers/reflectionsController';
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getQuestionsController);
router.post('/answer', auth, saveAnswerController);
router.get('/answers', auth, getUserAnswersController);

export default router;