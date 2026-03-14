import { useState } from 'react'

export default function Poll() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState([0, 0, 0, 0])

  const options = [
    'Strongly Agree',
    'Agree',
    'Disagree',
    'Strongly Disagree'
  ]

  const handleVote = () => {
    if (selectedOption !== null) {
      const newVotes = [...votes]
      newVotes[selectedOption]++
      setVotes(newVotes)
      setHasVoted(true)
    }
  }

  const totalVotes = votes.reduce((a, b) => a + b, 0)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="card-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Live Poll
      </h2>
      <p style={{ color: '#1e3a5f', marginBottom: '2rem' }}>
        Question: Is offline education better than online?
      </p>

      <div className="card">
        {!hasVoted ? (
          <>
            <div className="options-grid" style={{ gridTemplateColumns: '1fr' }}>
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(index)}
                  style={{ textAlign: 'left' }}
                >
                  {option}
                </div>
              ))}
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handleVote}
              disabled={selectedOption === null}
              style={{ marginTop: '2rem', width: '100%' }}
            >
              Submit Vote
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: '1.5rem' }}>Results:</h3>
            {options.map((option, index) => {
              const percentage = totalVotes > 0 ? (votes[index] / totalVotes) * 100 : 0
              return (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{option}</span>
                    <span>{votes[index]} votes ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#2a2a2a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: '#1e3a5f',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              )
            })}
            <p style={{ marginTop: '1rem', color: '#999999', textAlign: 'center' }}>
              Total votes: {totalVotes}
            </p>
          </>
        )}
      </div>
    </div>
  )
}