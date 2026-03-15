import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../App'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}

interface QuizSession {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit?: number
  shuffleQuestions: boolean
  createdBy: string
  isLocked?: boolean
  code?: string
  participants?: number
}

export default function QuizSystem() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { currentUser, deviceInfo } = useApp()
  
  // Mode selection
  const [mode, setMode] = useState<'list' | 'create' | 'join' | 'take'>('list')
  
  // Quiz list state
  const [quizzes, setQuizzes] = useState<QuizSession[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Join state
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizSession[]>([])
  
  // Create quiz state
  const [createStep, setCreateStep] = useState(1)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 10,
    shuffleQuestions: true,
    isLocked: false,
    password: ''
  })
  
  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  // Question creation state
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: Math.random().toString(36).substr(2, 9),
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: 'general',
    difficulty: 'easy',
    points: 10
  })

  // Load sample quizzes
  useEffect(() => {
    const sampleQuizzes: QuizSession[] = [
      {
        id: 'quiz-1',
        title: 'Data Structures & Algorithms',
        description: 'Test your DSA knowledge',
        questions: [
          {
            id: 'q1',
            question: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correctAnswer: 1,
            explanation: 'Binary search divides the search interval in half',
            category: 'algorithms',
            difficulty: 'easy',
            points: 10
          },
          {
            id: 'q2',
            question: 'Which data structure uses LIFO?',
            options: ['Queue', 'Stack', 'Array', 'List'],
            correctAnswer: 1,
            explanation: 'Stack follows Last In First Out',
            category: 'data-structures',
            difficulty: 'easy',
            points: 10
          }
        ],
        timeLimit: 10,
        shuffleQuestions: true,
        createdBy: 'Prof. Sharma',
        isLocked: false,
        code: 'DSA101',
        participants: 23
      },
      {
        id: 'quiz-2',
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript knowledge',
        questions: [
          {
            id: 'q3',
            question: 'What is closure in JavaScript?',
            options: [
              'Function with access to outer scope',
              'A way to close browser',
              'Type of loop',
              'Error handling'
            ],
            correctAnswer: 0,
            explanation: 'Closure remembers outer variables',
            category: 'javascript',
            difficulty: 'medium',
            points: 15
          }
        ],
        timeLimit: 5,
        shuffleQuestions: true,
        createdBy: 'Dr. Verma',
        isLocked: true,
        code: 'JS2024',
        participants: 15
      }
    ]
    setQuizzes(sampleQuizzes)
    setAvailableQuizzes(sampleQuizzes)
  }, [])

  const startQuiz = (quiz: QuizSession) => {
    const shuffled = quiz.shuffleQuestions 
      ? [...quiz.questions].sort(() => Math.random() - 0.5)
      : quiz.questions
    
    setActiveQuiz({ ...quiz, questions: shuffled })
    setMode('take')
    setQuizStarted(true)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setScore(0)
    setTimeLeft((quiz.timeLimit || 0) * 60)
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)

    if (activeQuiz) {
      const isCorrect = answerIndex === activeQuiz.questions[currentQuestionIndex].correctAnswer
      if (isCorrect) {
        setScore(score + activeQuiz.questions[currentQuestionIndex].points)
      }
    }
  }

  const nextQuestion = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQuizCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizStarted, quizCompleted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCreateQuiz = () => {
    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const password = newQuiz.isLocked ? Math.floor(1000 + Math.random() * 9000).toString() : undefined
    
    const newQuizSession: QuizSession = {
      id: `quiz-${Date.now()}`,
      title: newQuiz.title,
      description: newQuiz.description,
      questions: questions,
      timeLimit: newQuiz.timeLimit,
      shuffleQuestions: newQuiz.shuffleQuestions,
      createdBy: currentUser?.name || 'User',
      isLocked: newQuiz.isLocked,
      code: quizCode,
      participants: 0
    }

    alert(`Quiz Created!\nCode: ${quizCode}\n${password ? 'Password: ' + password : 'Public Quiz'}`)
    setMode('list')
    setQuizzes([newQuizSession, ...quizzes])
    setAvailableQuizzes([newQuizSession, ...availableQuizzes])
    
    // Reset form
    setCreateStep(1)
    setNewQuiz({
      title: '',
      description: '',
      timeLimit: 10,
      shuffleQuestions: true,
      isLocked: false,
      password: ''
    })
    setQuestions([])
  }

  const handleJoinQuiz = () => {
    if (!joinCode) return
    
    const quiz = availableQuizzes.find(q => q.code === joinCode)
    if (quiz?.isLocked && !joinPassword) {
      alert('This quiz is locked. Please enter the password.')
      return
    }
    
    alert(`Joining quiz: ${joinCode}`)
    startQuiz(quiz!)
  }

  const addQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question')
      return
    }
    
    setQuestions([...questions, { ...currentQuestion, id: Math.random().toString(36).substr(2, 9) }])
    setCurrentQuestion({
      id: Math.random().toString(36).substr(2, 9),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: 'general',
      difficulty: 'easy',
      points: 10
    })
  }

  const categories = ['all', ...new Set(quizzes.flatMap(q => q.questions.map(qq => qq.category)))]

  // Quiz Taking View
  if (mode === 'take' && activeQuiz && !quizCompleted) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100

    return (
      <div className="quiz-taking">
        <div className="quiz-header">
          <h2>{activeQuiz.title}</h2>
          <div className="quiz-timer">⏱️ {formatTime(timeLeft)}</div>
        </div>

        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
        </div>

        <div className="question-container">
          <div className="question-header">
            <span className="difficulty">{currentQuestion.difficulty}</span>
            <span className="points">{currentQuestion.points} pts</span>
          </div>

          <h3 className="question-text">{currentQuestion.question}</h3>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button className="btn btn-secondary" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
            ← Previous
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextQuestion}
            disabled={userAnswers[currentQuestionIndex] === undefined}
          >
            {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>

        <style>{`
          .quiz-taking {
            max-width: 700px;
            margin: 0 auto;
            padding: 1rem;
          }

          .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .quiz-header h2 {
            font-size: 1.3rem;
            color: #ffffff;
          }

          .quiz-timer {
            background: #1e3a5f;
            padding: 0.4rem 1rem;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: bold;
            color: #ffffff;
          }

          .quiz-progress {
            margin: 2rem 0;
            text-align: right;
            font-size: 0.9rem;
            color: #999999;
          }

          .progress-bar {
            height: 6px;
            background: #2a2a2a;
            border-radius: 3px;
            margin-bottom: 0.5rem;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: #1e3a5f;
            transition: width 0.3s ease;
          }

          .question-container {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .question-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .difficulty {
            padding: 0.2rem 0.6rem;
            background: #2a2a2a;
            border-radius: 4px;
            font-size: 0.8rem;
            text-transform: capitalize;
            color: #cccccc;
          }

          .points {
            color: #1e3a5f;
            font-weight: bold;
          }

          .question-text {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            color: #ffffff;
          }

          .options-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .option-btn {
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            color: #ffffff;
            padding: 0.8rem;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .option-btn:hover {
            border-color: #1e3a5f;
          }

          .option-btn.selected {
            background: #1e3a5f;
            border-color: #1e3a5f;
          }

          .option-letter {
            width: 24px;
            height: 24px;
            background: #1a1a1a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
            color: #ffffff;
          }

          .option-btn.selected .option-letter {
            background: #2a4a7a;
          }

          .quiz-navigation {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
          }
        `}</style>
      </div>
    )
  }

  // Quiz Results View
  if (quizCompleted && activeQuiz) {
    const totalPoints = activeQuiz.questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = (score / totalPoints) * 100

    return (
      <div className="quiz-results">
        <h2>Quiz Complete!</h2>
        
        <div className="score-card">
          <div className="score-circle">
            <span className="score-value">{score}</span>
            <span className="score-total">/{totalPoints}</span>
          </div>
          <div className="score-details">
            <div>Score: {percentage.toFixed(1)}%</div>
            <div>Correct: {userAnswers.filter((ans, idx) => ans === activeQuiz.questions[idx].correctAnswer).length}</div>
            <div>Total: {activeQuiz.questions.length}</div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => setMode('list')}>
            Back to Quizzes
          </button>
          <button className="btn btn-primary" onClick={() => startQuiz(activeQuiz)}>
            Try Again
          </button>
        </div>

        <style>{`
          .quiz-results {
            max-width: 500px;
            margin: 2rem auto;
            text-align: center;
          }

          .quiz-results h2 {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            color: #ffffff;
          }

          .score-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
          }

          .score-circle {
            width: 120px;
            height: 120px;
            margin: 0 auto 1rem;
            background: #0a0a0a;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 3px solid #1e3a5f;
          }

          .score-value {
            font-size: 2rem;
            font-weight: bold;
            color: #1e3a5f;
          }

          .score-total {
            font-size: 0.9rem;
            color: #999999;
          }

          .score-details {
            font-size: 1rem;
            color: #cccccc;
            line-height: 1.8;
          }

          .results-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
        `}</style>
      </div>
    )
  }

  // Join View
  if (mode === 'join') {
    return (
      <div className="join-container">
        <button className="back-btn" onClick={() => setMode('list')}>← Back</button>
        
        <div className="join-card">
          <h2>Join Quiz</h2>
          
          <div className="nearby-quizzes">
            <h3>Nearby Quizzes</h3>
            {availableQuizzes.map(quiz => (
              <div key={quiz.id} className="nearby-item" onClick={() => setJoinCode(quiz.code || '')}>
                <div className="nearby-icon">❓</div>
                <div className="nearby-details">
                  <div className="nearby-title">{quiz.title}</div>
                  <div className="nearby-meta">
                    <span>By {quiz.createdBy}</span>
                    <span>{quiz.participants} participants</span>
                  </div>
                </div>
                <div className="nearby-signal">
                  <div className="signal-bars">
                    {[1,2,3,4].map(bar => (
                      <div key={bar} className={`bar ${bar <= Math.random()*3+1 ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
                {quiz.isLocked && <span className="lock-icon">🔒</span>}
              </div>
            ))}
          </div>

          <div className="divider">
            <span>or enter code manually</span>
          </div>

          <div className="manual-join">
            <input
              type="text"
              className="code-input"
              placeholder="Enter quiz code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <input
              type="password"
              className="password-input"
              placeholder="Password (if locked)"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
            />
            <button className="btn btn-primary join-btn" onClick={handleJoinQuiz}>
              Join Quiz
            </button>
          </div>
        </div>

        <style>{`
          .join-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .back-btn {
            background: none;
            border: none;
            color: #1e3a5f;
            font-size: 0.9rem;
            cursor: pointer;
            margin-bottom: 1.5rem;
          }

          .join-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 2rem;
          }

          .join-card h2 {
            font-size: 1.3rem;
            color: #ffffff;
            margin-bottom: 1.5rem;
          }

          .nearby-quizzes {
            margin-bottom: 2rem;
          }

          .nearby-quizzes h3 {
            font-size: 0.9rem;
            color: #999999;
            margin-bottom: 1rem;
          }

          .nearby-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .nearby-item:hover {
            border-color: #1e3a5f;
          }

          .nearby-icon {
            width: 36px;
            height: 36px;
            background: #1a1a1a;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            color: #ffffff;
          }

          .nearby-details {
            flex: 1;
          }

          .nearby-title {
            font-size: 0.95rem;
            color: #ffffff;
            margin-bottom: 0.2rem;
          }

          .nearby-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.7rem;
            color: #999999;
          }

          .signal-bars {
            display: flex;
            align-items: flex-end;
            gap: 2px;
            height: 20px;
            margin-right: 1rem;
          }

          .signal-bars .bar {
            width: 3px;
            background: #2a2a2a;
            border-radius: 1px;
            transition: background 0.2s ease;
          }

          .signal-bars .bar:nth-child(1) { height: 6px; }
          .signal-bars .bar:nth-child(2) { height: 9px; }
          .signal-bars .bar:nth-child(3) { height: 12px; }
          .signal-bars .bar:nth-child(4) { height: 15px; }

          .signal-bars .bar.active {
            background: #4caf50;
          }

          .lock-icon {
            color: #ff4444;
          }

          .divider {
            position: relative;
            text-align: center;
            margin: 2rem 0;
          }

          .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #2a2a2a;
            z-index: 1;
          }

          .divider span {
            position: relative;
            z-index: 2;
            background: #1a1a1a;
            padding: 0 1rem;
            color: #999999;
            font-size: 0.8rem;
          }

          .manual-join {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .code-input,
          .password-input {
            width: 100%;
            padding: 0.8rem;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 1rem;
            text-align: center;
            letter-spacing: 2px;
          }

          .code-input:focus,
          .password-input:focus {
            outline: none;
            border-color: #1e3a5f;
          }

          .join-btn {
            width: 100%;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }

  // Create View
  if (mode === 'create') {
    return (
      <div className="create-container">
        <button className="back-btn" onClick={() => setMode('list')}>← Back</button>

        <div className="create-card">
          <h2>Create Quiz</h2>
          
          <div className="create-tabs">
            <button 
              className={`tab ${createStep === 1 ? 'active' : ''}`}
              onClick={() => setCreateStep(1)}
            >
              Basic Info
            </button>
            <button 
              className={`tab ${createStep === 2 ? 'active' : ''}`}
              onClick={() => setCreateStep(2)}
            >
              Questions ({questions.length})
            </button>
          </div>

          {createStep === 1 && (
            <div className="basic-info">
              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  placeholder="e.g., JavaScript Basics Quiz"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  placeholder="Describe your quiz"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  value={newQuiz.timeLimit}
                  onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                  min="1"
                  max="120"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newQuiz.shuffleQuestions}
                    onChange={(e) => setNewQuiz({ ...newQuiz, shuffleQuestions: e.target.checked })}
                  />
                  Shuffle Questions
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newQuiz.isLocked}
                    onChange={(e) => setNewQuiz({ ...newQuiz, isLocked: e.target.checked })}
                  />
                  Locked Quiz (requires password)
                </label>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="questions-section">
              <div className="questions-list">
                <h3>Added Questions</h3>
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-preview">
                    <span className="q-number">{idx + 1}</span>
                    <span className="q-text">{q.question.substring(0, 30)}...</span>
                    <span className="q-points">{q.points} pts</span>
                  </div>
                ))}
              </div>

              <div className="add-question">
                <h3>Add Question</h3>
                
                <div className="form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={currentQuestion.difficulty}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value as any })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={currentQuestion.category}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                    placeholder="e.g., algorithms, javascript"
                  />
                </div>

                <div className="options-section">
                  <label>Options</label>
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} className="option-input">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options]
                          newOptions[idx] = e.target.value
                          setCurrentQuestion({ ...currentQuestion, options: newOptions })
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                      <input
                        type="radio"
                        name="correctOption"
                        checked={currentQuestion.correctAnswer === idx}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Explanation (Optional)</label>
                  <textarea
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    placeholder="Explain the correct answer"
                    rows={2}
                  />
                </div>

                <button className="btn btn-primary add-question-btn" onClick={addQuestion}>
                  Add Question
                </button>
              </div>
            </div>
          )}

          <div className="create-actions">
            <button className="btn btn-secondary" onClick={() => setMode('list')}>
              Cancel
            </button>
            {createStep === 1 ? (
              <button 
                className="btn btn-primary" 
                onClick={() => setCreateStep(2)}
                disabled={!newQuiz.title}
              >
                Next: Add Questions
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleCreateQuiz}
                disabled={questions.length === 0}
              >
                Create Quiz
              </button>
            )}
          </div>
        </div>

        <style>{`
          .create-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .create-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 2rem;
          }

          .create-card h2 {
            font-size: 1.3rem;
            color: #ffffff;
            margin-bottom: 1.5rem;
          }

          .create-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid #2a2a2a;
            padding-bottom: 0.5rem;
          }

          .tab {
            background: none;
            border: none;
            color: #999999;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 0.9rem;
          }

          .tab.active {
            color: #ffffff;
            border-bottom: 2px solid #1e3a5f;
          }

          .basic-info {
            margin-bottom: 2rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #cccccc;
            font-size: 0.9rem;
          }

          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 0.6rem;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 0.9rem;
          }

          .form-group input:focus,
          .form-group textarea:focus,
          .form-group select:focus {
            outline: none;
            border-color: #1e3a5f;
          }

          .form-group.checkbox label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }

          .form-group.checkbox input {
            width: auto;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .questions-section {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 1.5rem;
          }

          .questions-list {
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
          }

          .questions-list h3 {
            font-size: 0.9rem;
            color: #ffffff;
            margin-bottom: 1rem;
          }

          .question-preview {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            border-bottom: 1px solid #2a2a2a;
            font-size: 0.8rem;
          }

          .q-number {
            color: #1e3a5f;
            font-weight: bold;
          }

          .q-text {
            flex: 1;
            color: #cccccc;
          }

          .q-points {
            color: #999999;
          }

          .add-question {
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            padding: 1.5rem;
          }

          .add-question h3 {
            font-size: 1rem;
            color: #ffffff;
            margin-bottom: 1.5rem;
          }

          .options-section {
            margin: 1.5rem 0;
          }

          .options-section label {
            display: block;
            margin-bottom: 0.5rem;
            color: #cccccc;
          }

          .option-input {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .option-input input[type="text"] {
            flex: 1;
            padding: 0.5rem;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            color: #ffffff;
          }

          .option-input input[type="radio"] {
            width: auto;
          }

          .add-question-btn {
            width: 100%;
            margin-top: 1rem;
          }

          .create-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #2a2a2a;
          }
        `}</style>
      </div>
    )
  }

  // List View (Default)
  return (
    <div className="quiz-system">
      <div className="quiz-header">
        <h1>Quizzes</h1>
        <div className="quiz-stats">
          <span>{quizzes.length} Available</span>
          <span>{deviceInfo.nearbyDevices.length} Online</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setMode('create')}>
            Create Quiz
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('join')}>
            Join Quiz
          </button>
        </div>
      </div>

      <div className="quiz-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="quizzes-grid">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-card-header">
              <h3>{quiz.title}</h3>
              {quiz.isLocked && <span className="lock-badge">Locked</span>}
            </div>
            <p className="quiz-description">{quiz.description}</p>
            
            <div className="quiz-meta">
              <div>{quiz.questions.length} questions</div>
              <div>{quiz.timeLimit} min</div>
              <div>{quiz.participants} participants</div>
            </div>

            <div className="quiz-categories">
              {Array.from(new Set(quiz.questions.map(q => q.category))).map(cat => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
            </div>

            <div className="quiz-footer">
              <span className="creator">By {quiz.createdBy}</span>
              <div className="footer-actions">
                <span className="quiz-code">{quiz.code}</span>
                <button className="btn btn-primary btn-small" onClick={() => startQuiz(quiz)}>
                  Start
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .quiz-system {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1rem;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .quiz-header h1 {
          font-size: 1.5rem;
          color: #ffffff;
        }

        .quiz-stats {
          display: flex;
          gap: 1rem;
          color: #999999;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 0.8rem;
        }

        .quiz-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 0 0.8rem;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          padding: 0.6rem;
          color: #ffffff;
          outline: none;
          font-size: 0.9rem;
        }

        .search-icon {
          color: #ffffff;
          font-size: 0.9rem;
        }

        .quiz-filters select {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #ffffff;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .quiz-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 1.2rem;
          transition: all 0.2s ease;
        }

        .quiz-card:hover {
          border-color: #1e3a5f;
        }

        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .quiz-card-header h3 {
          font-size: 1.1rem;
          color: #ffffff;
        }

        .lock-badge {
          font-size: 0.7rem;
          color: #ff4444;
          background: #331111;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .quiz-description {
          font-size: 0.9rem;
          color: #cccccc;
          margin-bottom: 1rem;
        }

        .quiz-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #999999;
          margin-bottom: 1rem;
        }

        .quiz-categories {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .category-tag {
          background: #2a2a2a;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #cccccc;
        }

        .quiz-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #2a2a2a;
        }

        .creator {
          font-size: 0.8rem;
          color: #999999;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quiz-code {
          font-size: 0.8rem;
          color: #1e3a5f;
          font-weight: 500;
        }

        .btn-small {
          padding: 0.3rem 1rem;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .quiz-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .quiz-filters {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}