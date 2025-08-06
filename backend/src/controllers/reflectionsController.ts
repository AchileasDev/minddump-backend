import { getQuestions, saveAnswer, getUserAnswers } from '../services/reflectionsService';

export const getQuestionsController = async (req, res) => {
  try {
    const questions = await getQuestions();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveAnswerController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId, answer } = req.body;
    if (!questionId || typeof questionId !== 'string' || !answer || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    await saveAnswer(userId, questionId, answer);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserAnswersController = async (req, res) => {
  try {
    const userId = req.user.id;
    const answers = await getUserAnswers(userId);
    res.json({ answers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};