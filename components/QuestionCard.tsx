
import React from 'react';
import { QuizItem } from '../types';

interface QuestionCardProps {
  quizItem: QuizItem;
  onAnswerSelect: (answer: string) => void;
  selectedAnswer: string | null;
  isResultView: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ quizItem, onAnswerSelect, selectedAnswer, isResultView }) => {

  const getButtonClass = (option: string) => {
    if (!isResultView) {
      return "bg-slate-700 hover:bg-sky-600 focus:ring-sky-500";
    }

    const isCorrectAnswer = option === quizItem.correctAnswer;
    const isSelectedAnswer = option === selectedAnswer;

    if (isCorrectAnswer) {
      return "bg-green-600 scale-105"; // Correct answer is always green
    }
    if (isSelectedAnswer && !isCorrectAnswer) {
      return "bg-red-600"; // User's wrong selection is red
    }

    return "bg-slate-800 opacity-60 cursor-not-allowed"; // Other incorrect options
  };

  return (
    <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out transform animate-fade-in">
      <div className="w-full h-48 sm:h-64 md:h-80 relative">
        <img 
          src={quizItem.imageUrl} 
          alt="سؤال عن كرة القدم" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent"></div>
      </div>

      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-100 text-center leading-tight">
          {quizItem.question}
        </h2>
        
        <div className="mt-8 grid grid-cols-1 gap-4">
          {quizItem.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              disabled={isResultView}
              className={`w-full p-4 text-lg font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
   