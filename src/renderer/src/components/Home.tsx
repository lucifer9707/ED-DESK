import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'

export default function Home() {
  const navigate = useNavigate()
  const { currentUser, deviceInfo, scanNearbyDevices } = useApp()
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinMethod, setJoinMethod] = useState<'code' | 'nearby'>('nearby')
  const [joinCode, setJoinCode] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<any>(null)
  const [sessionPassword, setSessionPassword] = useState('')
  
  // Real system metrics
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: '0%',
    memory: '0/16GB',
    memoryPercent: 0,
    network: 'WiFi',
    networkStrength: 0,
    bluetooth: 'Disabled',
    bluetoothDevices: 0,
    uptime: '0h'
  })

  // Nearby sessions (simulated)
  const [nearbySessions, setNearbySessions] = useState([
    { 
      id: '1', 
      name: 'Data Structures Chat', 
      type: 'chat', 
      participants: 4,
      isLocked: false,
      signal: 95,
      code: 'DS1234'
    },
    { 
      id: '2', 
      name: 'Algorithms Discussion', 
      type: 'discussion', 
      participants: 7,
      isLocked: true,
      signal: 87,
      code: 'ALGO55'
    },
    { 
      id: '3', 
      name: 'Quiz: JavaScript', 
      type: 'quiz', 
      participants: 12,
      isLocked: false,
      signal: 76,
      code: 'JS2024'
    },
    { 
      id: '4', 
      name: 'Assessment: Mid-term', 
      type: 'assessment', 
      participants: 23,
      isLocked: true,
      signal: 62,
      code: 'MID101'
    },
    { 
      id: '5', 
      name: 'Poll: Course Feedback', 
      type: 'poll', 
      participants: 8,
      isLocked: false,
      signal: 54,
      code: 'POLL22'
    }
  ])

  // Real-time system metrics update
  useEffect(() => {
    const updateMetrics = () => {
      // Simulate real CPU usage (random between 15-45%)
      const cpuUsage = Math.floor(Math.random() * 30) + 15
      
      // Simulate real memory usage (random between 3-8GB)
      const memoryUsed = (Math.random() * 5 + 3).toFixed(1)
      const memoryPercent = Math.floor((parseFloat(memoryUsed) / 16) * 100)
      
      // Simulate network strength (random between 60-100%)
      const networkStrength = Math.floor(Math.random() * 40) + 60
      
      // Simulate Bluetooth devices (random 0-3)
      const btDevices = Math.floor(Math.random() * 4)
      
      // Calculate uptime (in hours)
      const uptime = Math.floor(Math.random() * 24) + 1

      setSystemMetrics({
        cpu: `${cpuUsage}%`,
        memory: `${memoryUsed}/16GB`,
        memoryPercent,
        network: networkStrength > 80 ? 'WiFi 5GHz' : 'WiFi 2.4GHz',
        networkStrength,
        bluetooth: btDevices > 0 ? 'Connected' : 'Disabled',
        bluetoothDevices: btDevices,
        uptime: `${uptime}h`
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateSession = (type: string) => {
    const isLocked = type === 'assessment' || type === 'discussion'
    const password = isLocked ? Math.floor(1000 + Math.random() * 9000).toString() : undefined
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    alert(`Session created!\nType: ${type}\nCode: ${sessionCode}\n${password ? 'Password: ' + password : 'Public Session'}`)
    setShowCreateModal(false)
    
    // Navigate to the session type page
    navigate(`/${type}`)
  }

  const handleJoinByCode = () => {
    if (!joinCode) return
    const session = nearbySessions.find(s => s.code === joinCode)
    if (session?.isLocked && !sessionPassword) {
      alert('This session is locked. Please enter the password.')
      return
    }
    alert(`Joining session: ${joinCode}`)
    setShowJoinModal(false)
    setJoinCode('')
    setSessionPassword('')
  }

  const handleJoinDevice = (device: any) => {
    if (device.isLocked) {
      setSelectedDevice(device)
    } else {
      alert(`Joining public session: ${device.name}`)
      navigate(`/${device.type}`)
    }
  }

  const handleJoinLockedDevice = () => {
    if (selectedDevice && sessionPassword) {
      alert(`Joining locked session: ${selectedDevice.name}`)
      setSelectedDevice(null)
      setSessionPassword('')
      setShowJoinModal(false)
      navigate(`/${selectedDevice.type}`)
    }
  }

  return (
    <div className="home">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1 className="welcome-title">
            Welcome back, <span className="accent-text">{currentUser?.name || 'KK Professional'}</span>
          </h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Session
          </button>
          <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
            Join Session
          </button>
        </div>
      </div>

      {/* System Status Card */}
      <div className="status-card">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">CPU</div>
            <div className="status-value">{systemMetrics.cpu}</div>
            <div className="status-bar">
              <div className="status-fill" style={{ width: systemMetrics.cpu }}></div>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Memory</div>
            <div className="status-value">{systemMetrics.memory}</div>
            <div className="status-bar">
              <div className="status-fill" style={{ width: `${systemMetrics.memoryPercent}%` }}></div>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Network</div>
            <div className="status-value">{systemMetrics.network}</div>
            <div className="status-bar">
              <div className="status-fill" style={{ width: `${systemMetrics.networkStrength}%` }}></div>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Bluetooth</div>
            <div className="status-value">
              {systemMetrics.bluetooth} {systemMetrics.bluetoothDevices > 0 && `(${systemMetrics.bluetoothDevices})`}
            </div>
            <div className="status-indicator-dot ${systemMetrics.bluetoothDevices > 0 ? 'active' : ''}"></div>
          </div>
          
          <div className="status-item">
            <div className="status-label">Uptime</div>
            <div className="status-value">{systemMetrics.uptime}</div>
          </div>
          
          <div className="status-item">
            <div className="status-label">IP Address</div>
            <div className="status-value">{deviceInfo.ipAddress}</div>
          </div>
        </div>
      </div>

      {/* Nearby Devices Visualization */}
      <div className="nearby-section">
        <div className="section-header">
          <h2>Nearby Sessions</h2>
          <span className="section-count">{nearbySessions.length} available</span>
        </div>
        
        {/* Radar Visualization */}
        <div className="radar-container">
          <div className="radar">
            <div className="radar-center"></div>
            {nearbySessions.map((session, index) => {
              // Calculate position in circle based on signal strength and index
              const angle = (index / nearbySessions.length) * Math.PI * 2
              const distance = 40 + (session.signal / 100) * 60 // 40-100px radius
              const x = 150 + Math.cos(angle) * distance
              const y = 150 + Math.sin(angle) * distance
              
              return (
                <div
                  key={session.id}
                  className={`radar-dot ${session.isLocked ? 'locked' : 'public'}`}
                  style={{ left: x, top: y }}
                  title={`${session.name} (${session.signal}%)`}
                  onClick={() => handleJoinDevice(session)}
                >
                  <span className="dot-tooltip">{session.name}</span>
                </div>
              )
            })}
            <div className="radar-sweep"></div>
          </div>
        </div>

        {/* Nearby Sessions List */}
        <div className="sessions-list">
          {nearbySessions.map(session => (
            <div key={session.id} className="session-row" onClick={() => handleJoinDevice(session)}>
              <div className="session-icon">
                {session.type === 'chat' && '💬'}
                {session.type === 'assessment' && '📝'}
                {session.type === 'quiz' && '❓'}
                {session.type === 'poll' && '📊'}
                {session.type === 'discussion' && '🗣️'}
              </div>
              <div className="session-info">
                <div className="session-name">{session.name}</div>
                <div className="session-meta">
                  <span className="session-type">{session.type}</span>
                  <span className="session-participants">{session.participants} members</span>
                </div>
              </div>
              <div className="session-status">
                <div className="signal-strength">
                  <div className="signal-bars">
                    {[1,2,3,4].map(bar => (
                      <div key={bar} className={`bar ${bar <= session.signal/25 ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
                {session.isLocked ? (
                  <span className="lock-badge">Locked</span>
                ) : (
                  <span className="public-badge">Public</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Session</h3>
            <div className="modal-body">
              <div className="session-types">
                <button className="type-btn" onClick={() => handleCreateSession('chat')}>
                  <span className="type-icon">💬</span>
                  <span className="type-name">Chat</span>
                  <span className="type-desc">Public messaging</span>
                </button>
                <button className="type-btn" onClick={() => handleCreateSession('assessment')}>
                  <span className="type-icon">📝</span>
                  <span className="type-name">Assessment</span>
                  <span className="type-desc">Locked with password</span>
                </button>
                <button className="type-btn" onClick={() => handleCreateSession('quiz')}>
                  <span className="type-icon">❓</span>
                  <span className="type-name">Quiz</span>
                  <span className="type-desc">Interactive quiz</span>
                </button>
                <button className="type-btn" onClick={() => handleCreateSession('poll')}>
                  <span className="type-icon">📊</span>
                  <span className="type-name">Poll</span>
                  <span className="type-desc">Live voting</span>
                </button>
                <button className="type-btn" onClick={() => handleCreateSession('discussion')}>
                  <span className="type-icon">🗣️</span>
                  <span className="type-name">Discussion</span>
                  <span className="type-desc">Locked topic chat</span>
                </button>
              </div>
            </div>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Join Session</h3>
            
            <div className="join-tabs">
              <button 
                className={`tab-btn ${joinMethod === 'nearby' ? 'active' : ''}`}
                onClick={() => setJoinMethod('nearby')}
              >
                Nearby
              </button>
              <button 
                className={`tab-btn ${joinMethod === 'code' ? 'active' : ''}`}
                onClick={() => setJoinMethod('code')}
              >
                Enter Code
              </button>
            </div>

            <div className="modal-body">
              {joinMethod === 'nearby' ? (
                <div className="nearby-list">
                  {nearbySessions.map(session => (
                    <div key={session.id} className="nearby-item" onClick={() => handleJoinDevice(session)}>
                      <div className="nearby-icon">
                        {session.type === 'chat' && '💬'}
                        {session.type === 'assessment' && '📝'}
                        {session.type === 'quiz' && '❓'}
                        {session.type === 'poll' && '📊'}
                        {session.type === 'discussion' && '🗣️'}
                      </div>
                      <div className="nearby-details">
                        <div className="nearby-name">{session.name}</div>
                        <div className="nearby-code">{session.code}</div>
                      </div>
                      <div className="nearby-signal">{session.signal}%</div>
                      {session.isLocked && <span className="lock-icon">🔒</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="code-join">
                  <input
                    type="text"
                    className="code-input"
                    placeholder="Enter 6-digit code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Password (if locked)"
                    value={sessionPassword}
                    onChange={(e) => setSessionPassword(e.target.value)}
                  />
                  <button className="btn btn-primary join-btn" onClick={handleJoinByCode}>
                    Join Session
                  </button>
                </div>
              )}
            </div>

            {/* Locked device password modal */}
            {selectedDevice && (
              <div className="nested-modal">
                <div className="nested-content">
                  <h4>Enter Password</h4>
                  <p>Session: {selectedDevice.name}</p>
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Session password"
                    value={sessionPassword}
                    onChange={(e) => setSessionPassword(e.target.value)}
                    autoFocus
                  />
                  <div className="nested-actions">
                    <button className="btn btn-secondary" onClick={() => setSelectedDevice(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleJoinLockedDevice}>
                      Join
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        Powered by <a href="https://kkprofessional.vercel.app/" target="_blank" rel="noopener noreferrer">KK Professional</a>
      </footer>

      <style>{`
        .home {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .welcome-title {
          font-size: 1.5rem;
          font-weight: normal;
          color: #ffffff;
        }

        .accent-text {
          color: #1e3a5f;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 0.8rem;
        }

        /* Status Card */
        .status-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 1.2rem;
          margin-bottom: 2rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .status-item {
          padding: 0.5rem;
        }

        .status-label {
          font-size: 0.75rem;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.3rem;
        }

        .status-value {
          font-size: 0.95rem;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .status-bar {
          height: 4px;
          background: #2a2a2a;
          border-radius: 2px;
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          background: #1e3a5f;
          transition: width 0.3s ease;
        }

        .status-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4a4a4a;
          margin-top: 0.3rem;
        }

        .status-indicator-dot.active {
          background: #4caf50;
        }

        /* Nearby Section */
        .nearby-section {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.1rem;
          color: #ffffff;
        }

        .section-count {
          font-size: 0.85rem;
          color: #999999;
        }

        /* Radar */
        .radar-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .radar {
          position: relative;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          overflow: hidden;
        }

        .radar-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background: #1e3a5f;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .radar-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 20;
        }

        .radar-dot.public {
          background: #4caf50;
        }

        .radar-dot.locked {
          background: #ff4444;
        }

        .radar-dot:hover {
          transform: translate(-50%, -50%) scale(1.5);
        }

        .dot-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2a2a2a;
          color: #ffffff;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          white-space: nowrap;
          border: 1px solid #3a3a3a;
          margin-bottom: 0.5rem;
          display: none;
        }

        .radar-dot:hover .dot-tooltip {
          display: block;
        }

        .radar-sweep {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150px;
          height: 150px;
          background: linear-gradient(90deg, transparent, rgba(30, 58, 95, 0.1));
          border-radius: 50%;
          transform-origin: 0% 0%;
          animation: sweep 4s linear infinite;
        }

        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Sessions List */
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .session-row {
          display: flex;
          align-items: center;
          padding: 0.8rem;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .session-row:hover {
          border-color: #1e3a5f;
        }

        .session-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          border-radius: 6px;
          margin-right: 1rem;
          color: #1e3a5f;
        }

        .session-info {
          flex: 1;
        }

        .session-name {
          font-size: 0.95rem;
          color: #ffffff;
          margin-bottom: 0.2rem;
        }

        .session-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #999999;
        }

        .session-status {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .signal-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 16px;
        }

        .signal-bars .bar {
          width: 3px;
          background: #2a2a2a;
          border-radius: 1px;
          transition: background 0.2s ease;
        }

        .signal-bars .bar:nth-child(1) { height: 4px; }
        .signal-bars .bar:nth-child(2) { height: 7px; }
        .signal-bars .bar:nth-child(3) { height: 10px; }
        .signal-bars .bar:nth-child(4) { height: 13px; }

        .signal-bars .bar.active {
          background: #4caf50;
        }

        .lock-badge {
          font-size: 0.7rem;
          color: #ff4444;
          background: #331111;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .public-badge {
          font-size: 0.7rem;
          color: #4caf50;
          background: #113311;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 500px;
          width: 90%;
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 1.2rem;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #999999;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .modal-close:hover {
          color: #ffffff;
        }

        .session-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.8rem;
        }

        .type-btn {
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .type-btn:hover {
          border-color: #1e3a5f;
        }

        .type-icon {
          font-size: 1.2rem;
          color: #1e3a5f;
        }

        .type-name {
          font-size: 0.85rem;
          color: #ffffff;
        }

        .type-desc {
          font-size: 0.65rem;
          color: #999999;
        }

        .join-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #2a2a2a;
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          background: none;
          border: none;
          color: #999999;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.9rem;
          position: relative;
        }

        .tab-btn.active {
          color: #ffffff;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          right: 0;
          height: 2px;
          background: #1e3a5f;
        }

        .nearby-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .nearby-item {
          display: flex;
          align-items: center;
          padding: 0.8rem;
          border-bottom: 1px solid #2a2a2a;
          cursor: pointer;
        }

        .nearby-item:hover {
          background: #0a0a0a;
        }

        .nearby-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          border-radius: 4px;
          margin-right: 1rem;
          color: #1e3a5f;
        }

        .nearby-details {
          flex: 1;
        }

        .nearby-name {
          font-size: 0.9rem;
          color: #ffffff;
        }

        .nearby-code {
          font-size: 0.7rem;
          color: #999999;
        }

        .nearby-signal {
          font-size: 0.8rem;
          color: #4caf50;
          margin-right: 1rem;
        }

        .lock-icon {
          color: #ff4444;
        }

        .code-join {
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

        .nested-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }

        .nested-content {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 300px;
          width: 90%;
        }

        .nested-content h4 {
          font-size: 1rem;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .nested-content p {
          font-size: 0.85rem;
          color: #999999;
          margin-bottom: 1rem;
        }

        .nested-actions {
          display: flex;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .nested-actions button {
          flex: 1;
        }

        /* Footer */
        .footer {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #2a2a2a;
          text-align: center;
          font-size: 0.8rem;
          color: #999999;
        }

        .footer a {
          color: #1e3a5f;
          text-decoration: none;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1e3a5f;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .status-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .radar {
            width: 250px;
            height: 250px;
          }

          .radar-dot {
            transform: scale(0.8);
          }

          .session-types {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}