import { useNavigate } from 'react-router-dom'

const SESSIONS = [
  {
    type: 'chat',
    title: 'Chat Session',
    desc: 'Start a private or group chat',
    icon: '💬'
  },
  {
    type: 'assessment',
    title: 'Assessment',
    desc: 'Create and conduct assessments',
    icon: '📝'
  },
  {
    type: 'quiz',
    title: 'Quiz',
    desc: 'Interactive quizzes with scoring',
    icon: '❓'
  },
  {
    type: 'poll',
    title: 'Poll',
    desc: 'Create real-time polls',
    icon: '📊'
  },
  {
    type: 'discussion',
    title: 'Discussion',
    desc: 'Group discussions and forums',
    icon: '🗣️'
  }
]

export default function Home() {
  const navigate = useNavigate()

  const handleSessionClick = (type: string) => {
    navigate(`/${type}`)
  }

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Welcome to <span style={{ color: '#1e3a5f' }}>ED-DESK</span>
      </h1>
      <p style={{ color: '#999999', marginBottom: '3rem' }}>
        Select a session type to get started (Demo Mode - Authentication disabled)
      </p>

      <div className="session-grid">
        {SESSIONS.map((session) => (
          <div
            key={session.type}
            className="session-card"
            onClick={() => handleSessionClick(session.type)}
          >
            <div className="session-icon">{session.icon}</div>
            <h3 className="session-title">{session.title}</h3>
            <p className="session-desc">{session.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/create-session')}>
          + Create Custom Session
        </button>
      </div>
    </div>
  )
}