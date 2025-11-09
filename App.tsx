
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, QuizItem } from './types';
import { fetchQuizItem } from './services/geminiService';
import QuestionCard from './components/QuestionCard';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [quizItem, setQuizItem] = useState<QuizItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const loadNewQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    try {
      const newQuizItem = await fetchQuizItem();
      setQuizItem(newQuizItem);
      setGameState(GameState.PLAYING);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب السؤال. يرجى المحاولة مرة أخرى.");
      setGameState(GameState.MENU);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartGame = () => {
    setScore(0);
    loadNewQuestion();
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === quizItem?.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    setGameState(GameState.SHOWING_RESULT);
  };
  
  const handleNextQuestion = () => {
    loadNewQuestion();
  };

  const renderGameState = () => {
    if (error) {
        return (
            <div className="text-center text-red-400">
                <p className="text-2xl mb-4">{error}</p>
                <button
                    onClick={handleStartGame}
                    className="px-8 py-3 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-colors duration-300"
                >
                    إعادة المحاولة
                </button>
            </div>
        )
    }

    if (isLoading) {
        return <LoadingSpinner message="...جاري إنشاء سؤال وصورة فريدة" />;
    }

    switch (gameState) {
      case GameState.MENU:
        return (
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">اختبار كرة القدم</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">هل أنت مستعد لاختبار معلوماتك الكروية؟</p>
            <button
              onClick={handleStartGame}
              className="px-12 py-4 bg-sky-600 text-white text-2xl font-bold rounded-full hover:bg-sky-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ابدأ اللعب
            </button>
          </div>
        );
      case GameState.PLAYING:
      case GameState.SHOWING_RESULT:
        return (
          quizItem && (
            <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
              <div className="text-3xl font-bold text-white bg-slate-900/50 px-6 py-2 rounded-full">
                النتيجة: {score}
              </div>
              <QuestionCard
                quizItem={quizItem}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
                isResultView={gameState === GameState.SHOWING_RESULT}
              />
              {gameState === GameState.SHOWING_RESULT && (
                <button
                  onClick={handleNextQuestion}
                  className="mt-4 px-10 py-3 bg-green-600 text-white text-xl font-bold rounded-full hover:bg-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in"
                >
                  السؤال التالي
                </button>
              )}
            </div>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=5&random=1')] bg-cover bg-center opacity-10"></div>
      <main className="z-10 w-full flex items-center justify-center">
        {renderGameState()}
      </main>
    </div>
  );
};

export default App;
   