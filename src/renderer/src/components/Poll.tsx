import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../App'

interface PollOption {
  id: string
  text: string
  votes: string[]
}

interface Poll {
  id: string
  title: string
  question: string
  options: PollOption[]
  isMultipleChoice: boolean
  isAnonymous: boolean
  isLocked: boolean
  code: string
  createdBy: string
  creatorName: string
  createdAt: Date
  endTime?: Date
  totalVotes: number
  participants: number
}

export default function PollSystem() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { currentUser, deviceInfo } = useApp()
  
  // Mode selection
  const [mode, setMode] = useState<'list' | 'create' | 'join' | 'vote'>('list')
  
  // Polls state
  const [polls, setPolls] = useState<Poll[]>([])
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  
  // Join state
  const [joinCode, setJoinCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [availablePolls, setAvailablePolls] = useState<Poll[]>([])
  
  // Create poll state
  const [newPoll, setNewPoll] = useState({
    title: '',
    question: '',
    options: ['', ''],
    isMultipleChoice: false,
    isAnonymous: true,
    isLocked: false,
    password: '',
    duration: 5 // minutes
  })

  // Load sample polls
  useEffect(() => {
    const samplePolls: Poll[] = [
      {
        id: 'poll-1',
        title: 'Programming Languages',
        question: 'Which language should we focus on for the next project?',
        options: [
          { id: 'opt1', text: 'Python', votes: ['user1', 'user2', 'user3'] },
          { id: 'opt2', text: 'JavaScript', votes: ['user4', 'user5'] },
          { id: 'opt3', text: 'Java', votes: ['user6'] },
          { id: 'opt4', text: 'C++', votes: ['user7', 'user8'] }
        ],
        isMultipleChoice: false,
        isAnonymous: false,
        isLocked: false,
        code: 'POLL123',
        createdBy: 'teacher1',
        creatorName: 'Prof. Sharma',
        createdAt: new Date(Date.now() - 3600000),
        totalVotes: 8,
        participants: 8
      },
      {
        id: 'poll-2',
        title: 'Course Feedback',
        question: 'How satisfied are you with the offline learning platform?',
        options: [
          { id: 'opt5', text: 'Very Satisfied', votes: ['user1', 'user4', 'user7'] },
          { id: 'opt6', text: 'Satisfied', votes: ['user2', 'user5', 'user8'] },
          { id: 'opt7', text: 'Neutral', votes: ['user3'] },
          { id: 'opt8', text: 'Dissatisfied', votes: [] },
          { id: 'opt9', text: 'Very Dissatisfied', votes: [] }
        ],
        isMultipleChoice: false,
        isAnonymous: true,
        isLocked: true,
        code: 'FEED22',
        createdBy: 'admin1',
        creatorName: 'Dr. Verma',
        createdAt: new Date(Date.now() - 7200000),
        totalVotes: 7,
        participants: 7
      },
      {
        id: 'poll-3',
        title: 'Feature Request',
        question: 'What features would you like to see in the next update?',
        options: [
          { id: 'opt10', text: 'Video Conferencing', votes: ['user1', 'user3', 'user5', 'user7'] },
          { id: 'opt11', text: 'Screen Sharing', votes: ['user2', 'user4', 'user6', 'user8'] },
          { id: 'opt12', text: 'File Sharing', votes: ['user1', 'user4', 'user7'] },
          { id: 'opt13', text: 'Whiteboard', votes: ['user3', 'user6', 'user8'] },
          { id: 'opt14', text: 'Code Collaboration', votes: ['user2', 'user5', 'user7'] }
        ],
        isMultipleChoice: true,
        isAnonymous: true,
        isLocked: false,
        code: 'FEAT24',
        createdBy: 'teacher1',
        creatorName: 'Prof. Sharma',
        createdAt: new Date(Date.now() - 1800000),
        totalVotes: 12,
        participants: 12
      }
    ]
    setPolls(samplePolls)
    setAvailablePolls(samplePolls)
  }, [])

  const handleCreatePoll = () => {
    const options = newPoll.options
      .filter(opt => opt.trim() !== '')
      .map((text, index) => ({
        id: `opt-${Date.now()}-${index}`,
        text,
        votes: []
      }))

    const pollCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const password = newPoll.isLocked ? Math.floor(1000 + Math.random() * 9000).toString() : undefined

    const poll: Poll = {
      id: `poll-${Date.now()}`,
      title: newPoll.title,
      question: newPoll.question,
      options,
      isMultipleChoice: newPoll.isMultipleChoice,
      isAnonymous: newPoll.isAnonymous,
      isLocked: newPoll.isLocked,
      code: pollCode,
      createdBy: currentUser?.id || 'user',
      creatorName: currentUser?.name || 'User',
      createdAt: new Date(),
      endTime: new Date(Date.now() + newPoll.duration * 60000),
      totalVotes: 0,
      participants: 0
    }

    alert(`Poll Created!\nCode: ${pollCode}\n${password ? 'Password: ' + password : 'Public Poll'}`)
    setPolls([poll, ...polls])
    setAvailablePolls([poll, ...availablePolls])
    setShowCreateModal(false)
    setMode('list')
    
    // Reset form
    setNewPoll({
      title: '',
      question: '',
      options: ['', ''],
      isMultipleChoice: false,
      isAnonymous: true,
      isLocked: false,
      password: '',
      duration: 5
    })
  }

  const handleJoinPoll = () => {
    if (!joinCode) return
    
    const poll = availablePolls.find(p => p.code === joinCode)
    if (poll?.isLocked && !joinPassword) {
      alert('This poll is locked. Please enter the password.')
      return
    }
    
    setSelectedPoll(poll || null)
    setMode('vote')
    setShowJoinModal(false)
    setJoinCode('')
    setJoinPassword('')
  }

  const handleVote = (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId) && !polls.find(p => p.id === pollId)?.isMultipleChoice) return

    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(opt => {
          if (poll.isMultipleChoice) {
            if (opt.id === optionId) {
              const hasVoted = opt.votes.includes(currentUser?.id || '')
              return {
                ...opt,
                votes: hasVoted 
                  ? opt.votes.filter(id => id !== currentUser?.id)
                  : [...opt.votes, currentUser?.id || '']
              }
            }
            return opt
          } else {
            return {
              ...opt,
              votes: opt.id === optionId 
                ? [currentUser?.id || '']
                : []
            }
          }
        })

        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes.length, 0)
        const uniqueVoters = new Set(updatedOptions.flatMap(opt => opt.votes)).size
        
        setVotedPolls(new Set([...votedPolls, pollId]))
        return { 
          ...poll, 
          options: updatedOptions, 
          totalVotes,
          participants: uniqueVoters
        }
      }
      return poll
    }))
  }

  const getPercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : (votes / total) * 100
  }

  const formatTimeLeft = (endTime?: Date) => {
    if (!endTime) return 'No time limit'
    const diff = endTime.getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}m ${seconds}s left`
  }

  // List View
  if (mode === 'list') {
    return (
      <div className="poll-system">
        <div className="poll-header">
          <h1>Live Polls</h1>
          <div className="poll-stats">
            <span>{polls.length} Active</span>
            <span>{deviceInfo.nearbyDevices.length} Online</span>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setMode('create')}>
              Create Poll
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('join')}>
              Join Poll
            </button>
          </div>
        </div>

        <div className="polls-grid">
          {polls.map(poll => (
            <div key={poll.id} className="poll-card" onClick={() => {
              setSelectedPoll(poll)
              setMode('vote')
            }}>
              <div className="poll-card-header">
                <div>
                  <span className="poll-title-tag">{poll.title}</span>
                  <h3>{poll.question}</h3>
                </div>
                <div className="poll-badges">
                  {poll.isMultipleChoice && <span className="badge multiple">Multiple</span>}
                  {poll.isAnonymous && <span className="badge anonymous">Anonymous</span>}
                  {poll.isLocked && <span className="badge locked">Locked</span>}
                </div>
              </div>

              <div className="poll-meta">
                <span className="creator">By {poll.creatorName}</span>
                <span className="code">Code: {poll.code}</span>
                <span className="stats">{poll.participants} voters • {poll.totalVotes} votes</span>
              </div>

              <div className="poll-options-preview">
                {poll.options.slice(0, 3).map(option => (
                  <div key={option.id} className="option-preview">
                    <span className="option-text">{option.text}</span>
                    <span className="option-votes">{option.votes.length}</span>
                  </div>
                ))}
                {poll.options.length > 3 && (
                  <div className="more-options">+{poll.options.length - 3} more</div>
                )}
              </div>

              <div className="poll-footer">
                <span className="time">{formatTimeLeft(poll.endTime)}</span>
                <button className="btn btn-primary btn-small">Vote Now</button>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .poll-system {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .poll-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .poll-header h1 {
            font-size: 1.8rem;
            color: #ffffff;
          }

          .poll-stats {
            display: flex;
            gap: 1.5rem;
            color: #999999;
          }

          .header-actions {
            display: flex;
            gap: 1rem;
          }

          .polls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
          }

          .poll-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .poll-card:hover {
            border-color: #1e3a5f;
            transform: translateY(-2px);
          }

          .poll-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }

          .poll-title-tag {
            font-size: 0.7rem;
            color: #1e3a5f;
            background: #0a1a2a;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 0.5rem;
          }

          .poll-card-header h3 {
            font-size: 1.1rem;
            color: #ffffff;
            line-height: 1.4;
          }

          .poll-badges {
            display: flex;
            gap: 0.4rem;
            flex-wrap: wrap;
          }

          .badge {
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.65rem;
            font-weight: 500;
          }

          .badge.multiple {
            background: #1e3a5f;
            color: #ffffff;
          }

          .badge.anonymous {
            background: #4a4a4a;
            color: #ffffff;
          }

          .badge.locked {
            background: #ff4444;
            color: #ffffff;
          }

          .poll-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.8rem;
            color: #999999;
            margin-bottom: 1.2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #2a2a2a;
          }

          .creator {
            color: #1e3a5f;
          }

          .code {
            font-family: monospace;
            letter-spacing: 1px;
          }

          .poll-options-preview {
            margin-bottom: 1.2rem;
          }

          .option-preview {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px dashed #2a2a2a;
            font-size: 0.9rem;
          }

          .option-text {
            color: #cccccc;
          }

          .option-votes {
            color: #1e3a5f;
            font-weight: 500;
          }

          .more-options {
            text-align: center;
            font-size: 0.8rem;
            color: #666666;
            padding: 0.5rem 0;
          }

          .poll-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #2a2a2a;
          }

          .time {
            font-size: 0.8rem;
            color: #4caf50;
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
          <h2>Join Poll</h2>
          
          <div className="nearby-polls">
            <h3>Nearby Polls</h3>
            {availablePolls.map(poll => (
              <div key={poll.id} className="nearby-item" onClick={() => setJoinCode(poll.code)}>
                <div className="nearby-icon">📊</div>
                <div className="nearby-details">
                  <div className="nearby-title">{poll.title}</div>
                  <div className="nearby-meta">
                    <span>By {poll.creatorName}</span>
                    <span>{poll.participants} voters</span>
                  </div>
                </div>
                <div className="nearby-signal">
                  <div className="signal-bars">
                    {[1,2,3,4].map(bar => (
                      <div key={bar} className={`bar ${bar <= Math.random()*3+1 ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
                {poll.isLocked && <span className="lock-icon">🔒</span>}
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
              placeholder="Enter poll code"
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
            <button className="btn btn-primary join-btn" onClick={handleJoinPoll}>
              Join Poll
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

          .nearby-polls {
            margin-bottom: 2rem;
          }

          .nearby-polls h3 {
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
          <h2>Create Poll</h2>

          <div className="form-group">
            <label>Poll Title</label>
            <input
              type="text"
              value={newPoll.title}
              onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
              placeholder="e.g., Course Feedback 2024"
            />
          </div>

          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={newPoll.question}
              onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
              placeholder="What would you like to ask?"
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            {newPoll.options.map((opt, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const options = [...newPoll.options]
                    options[index] = e.target.value
                    setNewPoll({ ...newPoll, options })
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                {index === newPoll.options.length - 1 && index < 5 && (
                  <button 
                    className="add-option"
                    onClick={() => setNewPoll({
                      ...newPoll,
                      options: [...newPoll.options, '']
                    })}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
            <small className="helper-text">Minimum 2 options required</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={newPoll.duration}
                onChange={(e) => setNewPoll({ ...newPoll, duration: parseInt(e.target.value) })}
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newPoll.isMultipleChoice}
                onChange={(e) => setNewPoll({ ...newPoll, isMultipleChoice: e.target.checked })}
              />
              <span>Allow multiple choices</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newPoll.isAnonymous}
                onChange={(e) => setNewPoll({ ...newPoll, isAnonymous: e.target.checked })}
              />
              <span>Anonymous voting</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newPoll.isLocked}
                onChange={(e) => setNewPoll({ ...newPoll, isLocked: e.target.checked })}
              />
              <span>Locked poll (requires password)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setMode('list')}>
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCreatePoll}
              disabled={!newPoll.title || !newPoll.question || newPoll.options.filter(o => o.trim()).length < 2}
            >
              Create Poll
            </button>
          </div>
        </div>

        <style>{`
          .create-container {
            max-width: 600px;
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

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #cccccc;
            font-size: 0.9rem;
          }

          .form-group input {
            width: 100%;
            padding: 0.8rem;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 0.95rem;
          }

          .form-group input:focus {
            outline: none;
            border-color: #1e3a5f;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .option-input-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .option-input-group input {
            flex: 1;
          }

          .add-option {
            background: #1e3a5f;
            color: white;
            border: none;
            width: 40px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.2rem;
          }

          .helper-text {
            display: block;
            margin-top: 0.3rem;
            color: #666666;
            font-size: 0.8rem;
          }

          .settings-group {
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            padding: 1rem;
            margin: 1.5rem 0;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.8rem;
            color: #cccccc;
            cursor: pointer;
          }

          .checkbox-label:last-child {
            margin-bottom: 0;
          }

          .checkbox-label input[type="checkbox"] {
            width: auto;
            margin: 0;
          }

          .modal-actions {
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

  // Vote View
  if (mode === 'vote' && selectedPoll) {
    return (
      <div className="vote-container">
        <button className="back-btn" onClick={() => setMode('list')}>← Back to Polls</button>

        <div className="vote-card">
          <div className="vote-header">
            <div>
              <span className="poll-type">{selectedPoll.title}</span>
              <h2>{selectedPoll.question}</h2>
            </div>
            <div className="vote-meta">
              <span className="creator">By {selectedPoll.creatorName}</span>
              <span className="code">Code: {selectedPoll.code}</span>
              <span className="time">{formatTimeLeft(selectedPoll.endTime)}</span>
            </div>
          </div>

          <div className="vote-stats">
            <div className="stat">
              <span className="stat-value">{selectedPoll.participants}</span>
              <span className="stat-label">Voters</span>
            </div>
            <div className="stat">
              <span className="stat-value">{selectedPoll.totalVotes}</span>
              <span className="stat-label">Total Votes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{selectedPoll.options.length}</span>
              <span className="stat-label">Options</span>
            </div>
          </div>

          <div className="poll-options">
            {selectedPoll.options.map(option => {
              const percentage = getPercentage(option.votes.length, selectedPoll.totalVotes)
              const hasVoted = option.votes.includes(currentUser?.id || '')
              
              return (
                <div key={option.id} className="poll-option">
                  <button
                    className={`vote-btn ${hasVoted ? 'voted' : ''} ${votedPolls.has(selectedPoll.id) && !selectedPoll.isMultipleChoice ? 'disabled' : ''}`}
                    onClick={() => handleVote(selectedPoll.id, option.id)}
                    disabled={!selectedPoll.isMultipleChoice && votedPolls.has(selectedPoll.id)}
                  >
                    <span className="option-text">{option.text}</span>
                    <span className="vote-count">{option.votes.length}</span>
                  </button>
                  
                  {votedPolls.has(selectedPoll.id) && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="percentage">{percentage.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {votedPolls.has(selectedPoll.id) && (
            <div className="vote-message">
              {selectedPoll.isAnonymous ? 'Your vote is anonymous' : 'Thank you for voting!'}
            </div>
          )}
        </div>

        <style>{`
          .vote-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 1.5rem;
          }

          .vote-card {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 2rem;
          }

          .vote-header {
            margin-bottom: 2rem;
          }

          .poll-type {
            font-size: 0.8rem;
            color: #1e3a5f;
            background: #0a1a2a;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 0.5rem;
          }

          .vote-header h2 {
            font-size: 1.5rem;
            color: #ffffff;
            margin-bottom: 1rem;
            line-height: 1.4;
          }

          .vote-meta {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #999999;
            padding-bottom: 1rem;
            border-bottom: 1px solid #2a2a2a;
          }

          .vote-stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .stat {
            display: flex;
            flex-direction: column;
          }

          .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: #1e3a5f;
          }

          .stat-label {
            font-size: 0.7rem;
            color: #999999;
          }

          .poll-options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 2rem 0;
          }

          .poll-option {
            position: relative;
          }

          .vote-btn {
            width: 100%;
            background: #0a0a0a;
            border: 1px solid #2a2a2a;
            color: #ffffff;
            padding: 1rem;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            z-index: 1;
            font-size: 1rem;
          }

          .vote-btn:hover:not(:disabled) {
            border-color: #1e3a5f;
          }

          .vote-btn.voted {
            background: #1e3a5f;
            border-color: #1e3a5f;
          }

          .vote-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .vote-count {
            background: #2a2a2a;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
          }

          .vote-btn.voted .vote-count {
            background: #2a4a7a;
          }

          .progress-bar {
            position: relative;
            height: 6px;
            background: #2a2a2a;
            border-radius: 3px;
            margin-top: 0.5rem;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: #1e3a5f;
            transition: width 0.3s ease;
          }

          .percentage {
            position: absolute;
            right: 0;
            top: -20px;
            font-size: 0.8rem;
            color: #999999;
          }

          .vote-message {
            text-align: center;
            padding: 1rem;
            background: #0a1a2a;
            border: 1px solid #1e3a5f;
            border-radius: 6px;
            color: #ffffff;
            font-size: 0.9rem;
            margin-top: 2rem;
          }
        `}</style>
      </div>
    )
  }

  return null
}