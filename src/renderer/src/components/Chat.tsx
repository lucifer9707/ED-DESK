import { useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Chat() {
  const { sessionId } = useParams()
  const [messages, setMessages] = useState<any[]>([
    { id: 1, sender: 'System', content: 'Welcome to chat! (Demo Mode)', timestamp: new Date(), own: false }
  ])
  const [newMessage, setNewMessage] = useState('')

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
        own: true
      }
    ])
    setNewMessage('')
  }

  return (
    <div>
      <h2 className="card-title" style={{ marginBottom: '1rem' }}>
        Chat Session {sessionId ? `- ${sessionId}` : ''}
      </h2>
      <p style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Demo Mode - Messages are not saved</p>

      <div className="chat-container">
        <div className="chat-sidebar">
          <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>Participants</h3>
          <div style={{ color: '#cccccc' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '0.5rem' }}>
              👤 Teacher (Host)
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '0.5rem' }}>
              👤 Student 1
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
              👤 Student 2
            </div>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.own ? 'own' : ''}`}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: msg.own ? '#ffffff' : '#1e3a5f' }}>
                  {msg.sender}
                </div>
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.75rem', color: '#999999', marginTop: '0.25rem' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}