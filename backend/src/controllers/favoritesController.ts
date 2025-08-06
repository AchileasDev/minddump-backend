import { getFavorites, addFavorite, removeFavorite } from '../services/favoritesService';

export const getFavoritesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await getFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFavoriteController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.body;
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ error: 'Invalid questionId' });
    }
    await addFavorite(userId, questionId);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFavoriteController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ error: 'Invalid questionId' });
    }
    await removeFavorite(userId, questionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};