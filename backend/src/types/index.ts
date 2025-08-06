export interface ReflectionQuestion {
  id: string;
  text: string;
}

export interface ReflectionAnswer {
  questionId: string;
  userId: string;
  answer: string;
  timestamp: string;
}