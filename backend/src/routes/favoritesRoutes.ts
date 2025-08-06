import express from 'express';
import { getFavoritesController, addFavoriteController, removeFavoriteController } from '../controllers/favoritesController';
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getFavoritesController);
router.post('/', auth, addFavoriteController);
router.delete('/:questionId', auth, removeFavoriteController);

export default router;