import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Question } from '../types'
import { useApp } from '../App'

export default function Assessment() {
  const navigate = useNavigate()
  const { currentUser, deviceInfo } = useApp()
  
  // Mode selection
  const [mode, setMode] = useState<'create' | 'join' | 'list'>('list')
  
  // Join session states
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [availableAssessments, setAvailableAssessments] = useState<any[]>([])
  
  // Create session states
  const [step, setStep] = useState(1)
  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResults: 'after-end' as 'immediately' | 'after-end' | 'never',
    allowRetake: false,
    maxAttempts: 1,
    proctoring: false,
    questions: [] as Question[]
  })

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Math.random().toString(36).substr(2, 9),
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    codeTemplate: '',
    testCases: []
  })

  // Load available assessments
  useEffect(() => {
    // Simulate fetching available assessments
    setAvailableAssessments([
      { 
        id: '1', 
        title: 'Data Structures Mid-term', 
        creator: 'Prof. Sharma', 
        participants: 23,
        isLocked: true,
        code: 'DS2024',
        timeLimit: 60
      },
      { 
        id: '2', 
        title: 'Algorithms Quiz', 
        creator: 'Dr. Verma', 
        participants: 15,
        isLocked: false,
        code: 'ALGO55',
        timeLimit: 30
      },
      { 
        id: '3', 
        title: 'JavaScript Assessment', 
        creator: 'Teacher Kumar', 
        participants: 8,
        isLocked: true,
        code: 'JS101',
        timeLimit: 45
      }
    ])
  }, [])

  const addQuestion = () => {
    setAssessment({
      ...assessment,
      questions: [...assessment.questions, currentQuestion]
    })
    setCurrentQuestion({
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      codeTemplate: '',
      testCases: []
    })
  }

  const addTestCase = () => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: [
        ...(currentQuestion.testCases || []),
        { input: '', expectedOutput: '', weight: 1 }
      ]
    })
  }

  const handleCreateAssessment = () => {
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const password = Math.floor(1000 + Math.random() * 9000).toString()
    
    alert(`Assessment Created!\nCode: ${sessionCode}\nPassword: ${password}\nTitle: ${assessment.title}`)
    navigate('/assessment')
  }

  const handleJoinAssessment = () => {
    if (!joinCode) return
    
    const assessment = availableAssessments.find(a => a.code === joinCode)
    if (assessment?.isLocked && !joinPassword) {
      alert('This assessment is locked. Please enter the password.')
      return
    }
    
    alert(`Joining assessment: ${joinCode}`)
    navigate('/assessment/take')
  }

  const renderQuestionBuilder = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="mcq-builder">
            <h4>Options</h4>
            {currentQuestion.options?.map((opt, idx) => (
              <div key={idx} className="option-input">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...(currentQuestion.options || [])]
                    newOptions[idx] = e.target.value
                    setCurrentQuestion({ ...currentQuestion, options: newOptions })
                  }}
                />
                <input
                  type="radio"
                  name="correct"
                  checked={currentQuestion.correctAnswer === idx.toString()}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx.toString() })}
                />
              </div>
            ))}
          </div>
        )

      case 'true-false':
        return (
          <div className="truefalse-builder">
            <h4>Correct Answer</h4>
            <div className="truefalse-options">
              <label>
                <input
                  type="radio"
                  name="tf"
                  value="true"
                  checked={currentQuestion.correctAnswer === 'true'}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'true' })}
                />
                True
              </label>
              <label>
                <input
                  type="radio"
                  name="tf"
                  value="false"
                  checked={currentQuestion.correctAnswer === 'false'}
                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'false' })}
                />
                False
              </label>
            </div>
          </div>
        )

      case 'coding':
        return (
          <div className="coding-builder">
            <h4>Code Template</h4>
            <textarea
              className="code-template"
              value={currentQuestion.codeTemplate}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, codeTemplate: e.target.value })}
              placeholder="function solution() { ... }"
              rows={4}
            />
            
            <h4>Test Cases</h4>
            {currentQuestion.testCases?.map((tc, idx) => (
              <div key={idx} className="test-case">
                <input
                  type="text"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => {
                    const newTests = [...(currentQuestion.testCases || [])]
                    newTests[idx] = { ...tc, input: e.target.value }
                    setCurrentQuestion({ ...currentQuestion, testCases: newTests })
                  }}
                />
                <input
                  type="text"
                  placeholder="Output"
                  value={tc.expectedOutput}
                  onChange={(e) => {
                    const newTests = [...(currentQuestion.testCases || [])]
                    newTests[idx] = { ...tc, expectedOutput: e.target.value }
                    setCurrentQuestion({ ...currentQuestion, testCases: newTests })
                  }}
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={tc.weight}
                  onChange={(e) => {
                    const newTests = [...(currentQuestion.testCases || [])]
                    newTests[idx] = { ...tc, weight: parseInt(e.target.value) }
                    setCurrentQuestion({ ...currentQuestion, testCases: newTests })
                  }}
                  min="1"
                  max="10"
                />
                <button className="remove-test" onClick={() => {
                  const newTests = currentQuestion.testCases?.filter((_, i) => i !== idx)
                  setCurrentQuestion({ ...currentQuestion, testCases: newTests })
                }}>×</button>
              </div>
            ))}
            <button className="add-testcase" onClick={addTestCase}>
              + Add Test Case
            </button>
          </div>
        )

      default:
        return (
          <div className="shortanswer-builder">
            <h4>Expected Answer</h4>
            <textarea
              value={currentQuestion.correctAnswer as string}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
              placeholder="Enter expected answer..."
              rows={3}
            />
          </div>
        )
    }
  }

  // List View
  if (mode === 'list') {
    return (
      <div className="assessment-container">
        <div className="assessment-header">
          <h2>Assessments</h2>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setMode('create')}>
              Create Assessment
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('join')}>
              Join Assessment
            </button>
          </div>
        </div>

        <div className="available-list">
          <h3>Available Assessments</h3>
          {availableAssessments.map(assessment => (
            <div key={assessment.id} className="assessment-card">
              <div className="card-header">
                <h4>{assessment.title}</h4>
                {assessment.isLocked && <span className="lock-badge">🔒 Locked</span>}
              </div>
              <div className="card-details">
                <span>By {assessment.creator}</span>
                <span>⏱️ {assessment.timeLimit} min</span>
                <span>👥 {assessment.participants} participants</span>
              </div>
              <div className="card-footer">
                <span className="session-code">Code: {assessment.code}</span>
                <button 
                  className="btn btn-primary btn-small"
                  onClick={() => {
                    setMode('join')
                    setJoinCode(assessment.code)
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .assessment-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .assessment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .assessment-header h2 {
            font-size: 1.5rem;
            color: #ffffff;
            border-left: 3px solid #1e3a5f;
            padding-left: 1rem;
          }

          .header-actions {
            display: flex;
            gap: 1rem;
          }

          .available-list h3 {
            font-size: 1.1rem;
            color: #ffffff;
            margin-bottom: 1.5rem;
          }

          .assessment-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 1.2rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
          }

          .assessment-card:hover {
            border-color: #1e3a5f;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
          }

          .card-header h4 {
            font-size: 1rem;
            color: #ffffff;
          }

          .lock-badge {
            font-size: 0.7rem;
            color: #ff4444;
            background: #331111;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
          }

          .card-details {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #999999;
            margin-bottom: 1rem;
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.8rem;
            border-top: 1px solid #2a2a2a;
          }

          .session-code {
            font-size: 0.85rem;
            color: #1e3a5f;
            font-weight: 500;
          }

          .btn-small {
            padding: 0.3rem 1rem;
            font-size: 0.85rem;
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
          <h2>Join Assessment</h2>
          
          <div className="nearby-assessments">
            <h3>Nearby Assessments</h3>
            {availableAssessments.map(assessment => (
              <div key={assessment.id} className="nearby-item" onClick={() => setJoinCode(assessment.code)}>
                <div className="nearby-icon">📝</div>
                <div className="nearby-details">
                  <div className="nearby-title">{assessment.title}</div>
                  <div className="nearby-meta">
                    <span>By {assessment.creator}</span>
                    <span>{assessment.participants} participants</span>
                  </div>
                </div>
                <div className="nearby-signal">
                  <div className="signal-bars">
                    {[1,2,3,4].map(bar => (
                      <div key={bar} className={`bar ${bar <= Math.random()*3+1 ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
                {assessment.isLocked && <span className="lock-icon">🔒</span>}
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
              placeholder="Enter assessment code"
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
            <button className="btn btn-primary join-btn" onClick={handleJoinAssessment}>
              Join Assessment
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

          .nearby-assessments {
            margin-bottom: 2rem;
          }

          .nearby-assessments h3 {
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
            color: #1e3a5f;
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
  return (
    <div className="assessment-creator">
      <button className="back-btn" onClick={() => setMode('list')}>← Back to Assessments</button>

      <div className="creator-header">
        <h2>Create Assessment</h2>
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span>Basic</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span>Questions</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span>Settings</span>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="basic-info">
          <div className="form-group">
            <label>Assessment Title</label>
            <input
              type="text"
              value={assessment.title}
              onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
              placeholder="e.g., Mid-Term Examination"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={assessment.description}
              onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
              placeholder="Describe the assessment"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              value={assessment.timeLimit}
              onChange={(e) => setAssessment({ ...assessment, timeLimit: parseInt(e.target.value) })}
              min="5"
              max="300"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="questions-builder">
          <div className="question-list">
            <h3>Questions</h3>
            {assessment.questions.map((q, idx) => (
              <div key={q.id} className="question-preview">
                <span className="question-number">Q{idx + 1}</span>
                <span className="question-text">{q.text.substring(0, 30)}...</span>
                <span className="question-points">{q.points}pts</span>
              </div>
            ))}
          </div>

          <div className="question-editor">
            <h3>Add Question</h3>
            
            <div className="form-group">
              <label>Type</label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({
                  ...currentQuestion,
                  type: e.target.value as any,
                  options: e.target.value === 'mcq' ? ['', '', '', ''] : undefined
                })}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div className="form-group">
              <label>Question</label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Enter question"
                rows={2}
              />
            </div>

            {renderQuestionBuilder()}

            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                min="1"
                max="100"
              />
            </div>

            <div className="editor-actions">
              <button className="btn btn-primary" onClick={addQuestion}>
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="assessment-settings">
          <h3>Advanced Settings</h3>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={assessment.shuffleQuestions}
                  onChange={(e) => setAssessment({ ...assessment, shuffleQuestions: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
              <div className="setting-info">
                <h4>Shuffle Questions</h4>
                <p>Randomize order</p>
              </div>
            </div>

            <div className="setting-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={assessment.shuffleOptions}
                  onChange={(e) => setAssessment({ ...assessment, shuffleOptions: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
              <div className="setting-info">
                <h4>Shuffle Options</h4>
                <p>Randomize choices</p>
              </div>
            </div>

            <div className="setting-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={assessment.allowRetake}
                  onChange={(e) => setAssessment({ ...assessment, allowRetake: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
              <div className="setting-info">
                <h4>Allow Retakes</h4>
                <p>Multiple attempts</p>
              </div>
            </div>

            <div className="setting-item">
              <label>Show Results</label>
              <select
                value={assessment.showResults}
                onChange={(e) => setAssessment({ ...assessment, showResults: e.target.value as any })}
              >
                <option value="immediately">Immediately</option>
                <option value="after-end">After end</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="review-assessment">
          <h3>Review Assessment</h3>
          
          <div className="review-summary">
            <div className="summary-item">
              <span>Title:</span>
              <strong>{assessment.title}</strong>
            </div>
            <div className="summary-item">
              <span>Questions:</span>
              <strong>{assessment.questions.length}</strong>
            </div>
            <div className="summary-item">
              <span>Total Points:</span>
              <strong>{assessment.questions.reduce((sum, q) => sum + q.points, 0)}</strong>
            </div>
          </div>

          <div className="session-info">
            <p>After creation, you'll get a session code and password to share with students.</p>
          </div>
        </div>
      )}

      <div className="creator-footer">
        <button className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
          Previous
        </button>
        {step < 4 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Next
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleCreateAssessment}>
            Create Assessment
          </button>
        )}
      </div>

      <style>{`
        .assessment-creator {
          max-width: 1000px;
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

        .creator-header h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #ffffff;
          border-left: 3px solid #1e3a5f;
          padding-left: 1rem;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin: 2rem 0;
          position: relative;
          gap: 0.5rem;
        }

        .progress-steps::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #2a2a2a;
          z-index: 1;
        }

        .step {
          position: relative;
          z-index: 2;
          background: #1a1a1a;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #2a2a2a;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 70px;
          font-size: 0.8rem;
        }

        .step.active {
          border-color: #1e3a5f;
        }

        .step-number {
          width: 22px;
          height: 22px;
          background: #2a2a2a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.2rem;
          font-size: 0.7rem;
        }

        .step.active .step-number {
          background: #1e3a5f;
        }

        .questions-builder {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1.5rem;
        }

        .question-list {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 1rem;
          border: 1px solid #2a2a2a;
          max-height: 400px;
          overflow-y: auto;
        }

        .question-list h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .question-preview {
          padding: 0.6rem;
          border-bottom: 1px solid #2a2a2a;
          font-size: 0.8rem;
        }

        .question-preview:last-child {
          border-bottom: none;
        }

        .question-number {
          color: #1e3a5f;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        .question-points {
          color: #999999;
          font-size: 0.7rem;
          float: right;
        }

        .question-editor {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 1.5rem;
          border: 1px solid #2a2a2a;
        }

        .mcq-builder, .coding-builder, .truefalse-builder {
          background: #0a0a0a;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
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
          font-size: 0.85rem;
        }

        .test-case {
          display: grid;
          grid-template-columns: 1fr 1fr 60px auto;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }

        .test-case input {
          padding: 0.4rem;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          font-size: 0.8rem;
        }

        .remove-test {
          background: none;
          border: none;
          color: #ff4444;
          font-size: 1rem;
          cursor: pointer;
        }

        .add-testcase {
          background: #1e3a5f;
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .setting-item {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #2a2a2a;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .setting-info h4 {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .setting-info p {
          font-size: 0.75rem;
          color: #999999;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #2a2a2a;
          transition: .3s;
          border-radius: 20px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #1e3a5f;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        .review-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .summary-item span {
          color: #999999;
          font-size: 0.8rem;
        }

        .summary-item strong {
          color: #1e3a5f;
          font-size: 1.1rem;
        }

        .session-info {
          background: #0a0a0a;
          padding: 1rem;
          border-radius: 4px;
          border-left: 3px solid #1e3a5f;
          font-size: 0.9rem;
          color: #cccccc;
        }

        .creator-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #2a2a2a;
        }

        @media (max-width: 768px) {
          .questions-builder {
            grid-template-columns: 1fr;
          }
          
          .test-case {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}