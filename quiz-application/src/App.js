import React, { useState, useEffect } from "react";
import { Questione } from "./components";
const API_URL_COMPUTERS =
  "https://opentdb.com/api.php?amount=15&category=18&type=multiple";
function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  useEffect(() => {
    fetch(API_URL_COMPUTERS)
      .then((res) => res.json())
      .then((data) => {
        const questions = data.results.map((question)=>({
          ...question,
          answers: [question.correct_answer, ...question.incorrect_answers].sort(()=> Math.random() - 0.5),
        }));
        setQuestions(questions);
      });
  }, []);
  const handleAnswer = (answer) => {
    if(!showAnswers){
    if (answer === questions[currentIndex].correct_answer) {
      setScore(score + 1);
    }
  }
    setShowAnswers(true);
  };
  const handleNextQuestion =()=>{
    setShowAnswers(false);
    setCurrentIndex(currentIndex + 1)
  }
  return questions.length > 0 ? (
    <div className="container">
      {currentIndex >= questions.length ? (
        <h1 className="text-2xl font-bold text-gray-600">
          Game Ended! Your score is {score} .
        </h1>
      ) : (
        <Questione 
        data={questions[currentIndex]} 
        handleAnswer={handleAnswer}
        handleNextQuestion={handleNextQuestion}
        showAnswers={showAnswers} />
      )}
    </div>
  ) : (
    <h2 className="text-2xl text-gray-700 font-bold">Mans Loading..Wait!</h2>
  );
}
export default App;
