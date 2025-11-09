
export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl: string;
}

export enum GameState {
  MENU,
  PLAYING,
  SHOWING_RESULT,
}
   