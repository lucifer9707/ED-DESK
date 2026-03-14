import { useState } from 'react'

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const questions = [
    {
      id: 1,
      text: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid']
    },
    {
      id: 2,
      text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn']
    },
    {
      id: 3,
      text: 'What is 2 + 2?',
      options: ['3', '4', '5', '6']
    }
  ]

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = () => {
    alert('Assessment submitted! (Demo Mode)')
  }

  return (
    <div className="assessment-container">
      <h2 className="card-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Sample Assessment
      </h2>
      <p style={{ color: '#1e3a5f', marginBottom: '2rem' }}>Demo Mode - Questions are for demonstration</p>

      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: '#1e3a5f', fontWeight: 'bold' }}>
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>
          {questions[currentQuestion].text}
        </h3>

        <div className="options-grid">
          {questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              className={`option-item ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswer(index)}
            >
              {option}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button className="btn btn-primary" onClick={submitAssessment}>
              Submit Assessment
            </button>
          ) : (
            <button className="btn btn-primary" onClick={nextQuestion}>
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  )
}