import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        ED<span>-DESK</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          Home
        </Link>
        <Link to="/create-session" className={`nav-link ${isActive('/create-session')}`}>
          Create Session
        </Link>
        <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
          Chat
        </Link>
        <Link to="/assessment" className={`nav-link ${isActive('/assessment')}`}>
          Assessment
        </Link>
        <Link to="/quiz" className={`nav-link ${isActive('/quiz')}`}>
          Quiz
        </Link>
        <Link to="/poll" className={`nav-link ${isActive('/poll')}`}>
          Poll
        </Link>
        <Link to="/discussion" className={`nav-link ${isActive('/discussion')}`}>
          Discussion
        </Link>
      </div>
      <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
        Demo Mode
      </button>
    </nav>
  )
}