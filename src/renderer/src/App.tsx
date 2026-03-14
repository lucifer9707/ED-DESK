import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './components/Home'
import CreateSession from './components/CreateSession'
import Chat from './components/Chat'
import Assessment from './components/Assessment'
import Quiz from './components/Quiz'
import Poll from './components/Poll'
import Discussion from './components/Discussion'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-session" element={<CreateSession />} />
            <Route path="/chat/:sessionId?" element={<Chat />} />
            <Route path="/assessment/:sessionId?" element={<Assessment />} />
            <Route path="/quiz/:sessionId?" element={<Quiz />} />
            <Route path="/poll/:sessionId?" element={<Poll />} />
            <Route path="/discussion/:sessionId?" element={<Discussion />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App