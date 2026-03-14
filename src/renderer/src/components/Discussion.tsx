import { useState } from 'react'

export default function Discussion() {
  const [topics] = useState([
    {
      id: 1,
      title: 'Advantages of Offline Learning',
      author: 'Teacher',
      replies: 5,
      lastActive: '5 min ago'
    },
    {
      id: 2,
      title: 'Blockchain in Education',
      author: 'Student 1',
      replies: 3,
      lastActive: '15 min ago'
    },
    {
      id: 3,
      title: 'Peer-to-Peer Communication',
      author: 'Student 2',
      replies: 8,
      lastActive: '1 hour ago'
    }
  ])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="card-title" style={{ fontSize: '2rem' }}>
          Discussion Forum
        </h2>
        <button className="btn btn-primary">New Topic</button>
      </div>

      <p style={{ color: '#1e3a5f', marginBottom: '2rem' }}>Demo Mode - Browse discussion topics</p>

      <div className="card">
        {topics.map((topic) => (
          <div
            key={topic.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid #2a2a2a',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            className="topic-item"
            onClick={() => alert('Topic view - Demo Mode')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#ffffff' }}>{topic.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: '#999999', fontSize: '0.9rem' }}>
                  <span>By: {topic.author}</span>
                  <span>Replies: {topic.replies}</span>
                  <span>Last active: {topic.lastActive}</span>
                </div>
              </div>
              <div style={{ color: '#1e3a5f' }}>→</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}