export interface Session {
  id: string
  type: 'chat' | 'assessment' | 'quiz' | 'poll' | 'discussion'
  name: string
  createdAt: Date
  createdBy: string
  status: 'active' | 'ended'
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  sessionId: string
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer?: number
}

export interface Assessment {
  id: string
  title: string
  questions: Question[]
  timeLimit?: number
}