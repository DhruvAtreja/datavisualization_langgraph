export const QuestionDisplay = ({
  displayedQuestions,
  handleQuestionClick,
}: {
  displayedQuestions: string[]
  handleQuestionClick: (question: string) => void
}) => {
  return (
    <div className='mb-8 w-5/6 text-center'>
      {displayedQuestions.map((question, index) => (
        <div
          key={index}
          className={`text-white cursor-pointer mb-4 hover:text-yellow-300 transition-all duration-300 transform hover:scale-105 ${
            index === 1 || index === 3
              ? 'text-3xl opacity-60'
              : index === 2
              ? 'text-4xl opacity-100'
              : 'text-xl opacity-50'
          }`}
          style={{
            animation: `float ${Math.random() * 2 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
          onClick={() => handleQuestionClick(question)}
        >
          {question}
        </div>
      ))}
    </div>
  )
}
