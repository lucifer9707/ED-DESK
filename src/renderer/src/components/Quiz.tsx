import { useState } from 'react'

export default function Quiz() {
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const questions = [
    {
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Hyper Transfer Markup Language',
        'Home Tool Markup Language'
      ],
      correct: 0
    },
    {
      question: 'Which CSS property is used to change the text color?',
      options: ['text-color', 'font-color', 'color', 'text-style'],
      correct: 2
    },
    {
      question: 'What is the correct way to declare a variable in JavaScript?',
      options: ['v carName;', 'var carName;', 'variable carName;', 'let = carName;'],
      correct: 1
    }
  ]

  const handleAnswer = (selectedOption: number) => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore(score + 1)
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
    }
  }

  const restartQuiz = () => {
    setScore(0)
    setCurrentQuestion(0)
    setShowResult(false)
  }

  if (showResult) {
    return (
      <div className="assessment-container">
        <div className="question-card" style={{ textAlign: 'center' }}>
          <h2 className="card-title">Quiz Complete!</h2>
          <div style={{ fontSize: '3rem', margin: '2rem 0', color: '#1e3a5f' }}>
            {score} / {questions.length}
          </div>
          <p style={{ marginBottom: '2rem' }}>
            You scored {((score / questions.length) * 100).toFixed(0)}%
          </p>
          <button className="btn btn-primary" onClick={restartQuiz}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-container">
      <h2 className="card-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Tech Quiz
      </h2>
      <p style={{ color: '#1e3a5f', marginBottom: '2rem' }}>Demo Mode - Test your knowledge</p>

      <div className="question-card">
        <div style={{ marginBottom: '1rem', color: '#999999' }}>
          Question {currentQuestion + 1} of {questions.length}
        </div>
        
        <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>
          {questions[currentQuestion].question}
        </h3>

        <div className="options-grid">
          {questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              className="option-item"
              onClick={() => handleAnswer(index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}