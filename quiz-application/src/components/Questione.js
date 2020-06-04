import React from "react";

const Questione = ({
  showAnswers,
  handleAnswer,
  handleNextQuestion,
  data: { question, correct_answer, answers },
}) => {

  return (
    <div className="flex flex-col">
      <div className="bg-white text-gray-800 p-10 rounded-lg shadow-lg">
        <h2
          className="text-2xl"
          dangerouslySetInnerHTML={{ __html: question }}
        />
      </div>
      <div className="grid grid-cols-2 gap-6 mt-6">
        {answers.map((answer,idx) => {
          const textColor = showAnswers ? answer === correct_answer 
          ? 'text-green-700' 
          : 'text-red-700' 
          : 'text-gray-700';

        return(
        <button key={idx}
            className={`${textColor} bg-gray-100 p-4 font-semibold rounded shadow-lg`}
            onClick={() => handleAnswer(answer)} dangerouslySetInnerHTML={{ __html: answer }} >
          </button>
        )})}
      </div>
      {showAnswers && (  
      <button 
      onClick={handleNextQuestion}
      className='bg-teal-600 ml-auto mt-20 p-5 text-gray-100 font-semibold rounded shadow-lg'>Next Question</button>
      )} 
    </div>
  );
};
export default Questione;
