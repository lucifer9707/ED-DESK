import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateSession() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: 'chat',
    name: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo: just navigate to the selected type
    navigate(`/${formData.type}`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="card-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Create New Session
      </h2>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Session Type</label>
            <select
              className="form-input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="chat">Chat Session</option>
              <option value="assessment">Assessment</option>
              <option value="quiz">Quiz</option>
              <option value="poll">Poll</option>
              <option value="discussion">Discussion</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Session Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter session name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Describe your session"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Session (Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}