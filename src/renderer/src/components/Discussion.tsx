import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../App'

interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userRole: 'teacher' | 'student' | 'admin'
  userBadges?: string[]
  content: string
  codeSnippet?: string
  attachments?: Attachment[]
  timestamp: Date
  editedAt?: Date
  likes: string[]
  dislikes: string[]
  replies?: Reply[] // Nested replies
  parentId?: string
  isSolution?: boolean
  isPinned?: boolean
  isEdited?: boolean
}

interface Attachment {
  id: string
  type: 'image' | 'code' | 'link' | 'file'
  url: string
  name: string
  size?: number
}

interface Discussion {
  id: string
  topic: string
  content: string
  codeSnippet?: string
  createdBy: string
  creatorName: string
  creatorAvatar: string
  creatorRole: 'teacher' | 'student' | 'admin'
  creatorBadges?: string[]
  createdAt: Date
  views: number
  replies: Reply[]
  likes: number
  dislikes: number
  tags: string[]
  category: string
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  isSticky: boolean
  hasSolution: boolean
  lastActivity: Date
  contributors: string[]
  attachments?: Attachment[]
  relatedDiscussions?: string[]
}

interface Category {
  id: string
  name: string
  icon: string
  description: string
  count: number
}

interface UserStats {
  topicsCreated: number
  repliesGiven: number
  solutionsMarked: number
  likesReceived: number
  badges: string[]
  reputation: number
  joinDate: Date
  lastActive: Date
}

export default function DiscussionForum() {
  const { sessionId, discussionId } = useParams()
  const navigate = useNavigate()
  const { currentUser, deviceInfo } = useApp()
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Main state
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  
  // UI state
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered' | 'solved'>('latest')
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null)
  
  // Create/Edit states
  const [newDiscussion, setNewDiscussion] = useState({
    topic: '',
    content: '',
    category: 'general',
    tags: [] as string[],
    codeSnippet: '',
    attachments: [] as Attachment[]
  })
  
  const [editDiscussion, setEditDiscussion] = useState<Discussion | null>(null)
  const [newReply, setNewReply] = useState('')
  const [replyCode, setReplyCode] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  
  // Input states
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [contributorInput, setContributorInput] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load sample data
  useEffect(() => {
    loadCategories()
    loadDiscussions()
    loadUserStats()
  }, [])

  const loadCategories = () => {
    const sampleCategories: Category[] = [
      {
        id: 'general',
        name: 'General Discussion',
        icon: '💬',
        description: 'General topics about computer science and programming',
        count: 156
      },
      {
        id: 'algorithms',
        name: 'Algorithms',
        icon: '⚡',
        description: 'Discuss algorithm design, analysis, and optimization',
        count: 89
      },
      {
        id: 'data-structures',
        name: 'Data Structures',
        icon: '📊',
        description: 'Arrays, linked lists, trees, graphs, and more',
        count: 67
      },
      {
        id: 'web-dev',
        name: 'Web Development',
        icon: '🌐',
        description: 'Frontend, backend, and full-stack development',
        count: 123
      },
      {
        id: 'mobile-dev',
        name: 'Mobile Development',
        icon: '📱',
        description: 'iOS, Android, and cross-platform development',
        count: 45
      },
      {
        id: 'database',
        name: 'Databases',
        icon: '🗄️',
        description: 'SQL, NoSQL, database design and optimization',
        count: 34
      },
      {
        id: 'system-design',
        name: 'System Design',
        icon: '🏗️',
        description: 'Architecture, scalability, and distributed systems',
        count: 28
      },
      {
        id: 'career',
        name: 'Career Advice',
        icon: '🚀',
        description: 'Interview prep, resume reviews, and career growth',
        count: 92
      }
    ]
    setCategories(sampleCategories)
  }

  const loadDiscussions = () => {
    setIsLoading(true)
    
    const sampleDiscussions: Discussion[] = [
      {
        id: '1',
        topic: 'Understanding Time Complexity: A Comprehensive Guide',
        content: `I've been struggling with understanding Big O notation and time complexity analysis. Can someone explain the difference between O(n), O(log n), and O(n log n) with practical examples?

I understand the basics but when it comes to analyzing recursive algorithms, I get confused. For example, how do we analyze the time complexity of a recursive function like merge sort?

Would appreciate if someone could provide:
1. Clear definitions
2. Visual examples
3. Common pitfalls to avoid
4. Practice problems with solutions`,
        codeSnippet: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}`,
        createdBy: 'user-1',
        creatorName: 'Dr. Sharma',
        creatorAvatar: '👨‍🏫',
        creatorRole: 'teacher',
        creatorBadges: ['PhD', 'Mentor', 'Top Contributor'],
        createdAt: new Date(Date.now() - 86400000 * 2),
        views: 1234,
        replies: [
          {
            id: 'r1',
            userId: 'user-2',
            userName: 'Priya Singh',
            userAvatar: '👩‍🎓',
            userRole: 'student',
            userBadges: ['Scholar', 'Helper'],
            content: `Great question! Let me break down time complexity:

## Big O Notation Explained

**O(1) - Constant Time**
- Operations that take the same time regardless of input size
- Example: Array access by index

**O(log n) - Logarithmic Time**
- Operations that cut the problem size in half each step
- Example: Binary search

**O(n) - Linear Time**
- Operations that scale linearly with input size
- Example: Simple loop through array

**O(n log n) - Linearithmic Time**
- Common in efficient sorting algorithms
- Example: Merge sort, quicksort (average case)

**O(n²) - Quadratic Time**
- Operations with nested loops
- Example: Bubble sort, selection sort

For merge sort specifically:
- Each level splits array in half: log n levels
- At each level, we do O(n) work merging
- Total: O(n log n)`,
            codeSnippet: `// Binary Search - O(log n)
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
            timestamp: new Date(Date.now() - 43200000),
            likes: ['user-3', 'user-4', 'user-5', 'user-6'],
            dislikes: [],
            replies: [
              {
                id: 'r1_1',
                userId: 'user-3',
                userName: 'Rahul Kumar',
                userAvatar: '👨‍🎓',
                userRole: 'student',
                content: 'This is incredibly helpful! Can you also explain space complexity?',
                timestamp: new Date(Date.now() - 21600000),
                likes: ['user-2'],
                dislikes: []
              },
              {
                id: 'r1_2',
                userId: 'user-2',
                userName: 'Priya Singh',
                userAvatar: '👩‍🎓',
                userRole: 'student',
                content: `Space complexity refers to the amount of memory an algorithm uses:

**O(1)** - Constant space (in-place algorithms)
**O(n)** - Linear space (copying arrays)
**O(n²)** - Quadratic space (2D matrices)

For recursive algorithms, we also need to consider the call stack space!`,
                timestamp: new Date(Date.now() - 10800000),
                likes: ['user-1', 'user-3'],
                dislikes: []
              }
            ],
            isSolution: false,
            isPinned: false
          },
          {
            id: 'r2',
            userId: 'user-4',
            userName: 'Prof. Verma',
            userAvatar: '👨‍🏫',
            userRole: 'teacher',
            userBadges: ['PhD', 'Expert'],
            content: `Excellent discussion! Let me add some visual resources:

## Time Complexity Graph
- O(1): Flat line
- O(log n): Slowly increasing curve
- O(n): Straight diagonal line
- O(n log n): Slightly curved line
- O(n²): Steep parabola

## Practical Tips
1. Always look for nested loops - they often indicate O(n²)
2. Recursion with multiple calls per level often indicates O(2ⁿ)
3. Sorting algorithms are usually O(n log n)
4. Hash table operations are O(1) average case

Here's a visualization tool I created: [Complexity Visualizer](https://example.com/complexity)`,
            attachments: [
              {
                id: 'att1',
                type: 'image',
                url: '#',
                name: 'complexity-graph.png'
              }
            ],
            timestamp: new Date(Date.now() - 86400000),
            likes: ['user-1', 'user-2', 'user-5', 'user-7'],
            dislikes: [],
            isSolution: true,
            isPinned: true
          }
        ],
        likes: 45,
        dislikes: 3,
        tags: ['algorithms', 'time-complexity', 'big-o', 'beginner'],
        category: 'algorithms',
        isPinned: true,
        isLocked: false,
        isSolved: true,
        isSticky: false,
        hasSolution: true,
        lastActivity: new Date(Date.now() - 3600000),
        contributors: ['user-2', 'user-4', 'user-5'],
        attachments: []
      },
      {
        id: '2',
        topic: 'System Design: Designing a URL Shortener like TinyURL',
        content: `I'm preparing for system design interviews and want to understand how to design a URL shortener service. 

## Requirements:
- Generate unique short URLs
- Handle millions of URLs
- High availability
- Low latency redirects

## My initial thoughts:
1. Use base62 encoding for short URLs
2. Database to store mappings
3. Cache frequently accessed URLs
4. Load balancers for scaling

What am I missing? How would you handle:
- Custom short URLs?
- Analytics tracking?
- Expiration policies?
- Rate limiting?`,
        createdBy: 'user-5',
        creatorName: 'Anjali Patel',
        creatorAvatar: '👩‍💻',
        creatorRole: 'student',
        creatorBadges: ['SDE Intern', 'Top Contributor'],
        createdAt: new Date(Date.now() - 86400000 * 5),
        views: 892,
        replies: [
          {
            id: 'r3',
            userId: 'user-6',
            userName: 'Vikram Singh',
            userAvatar: '👨‍💻',
            userRole: 'student',
            content: `Great question! Here's a comprehensive system design:

## Architecture Components

### 1. **API Layer**
- POST /shorten - Create short URL
- GET /{shortCode} - Redirect
- GET /analytics/{shortCode} - Get stats

### 2. **Load Balancers**
- Distribute traffic across multiple app servers
- Use consistent hashing for cache affinity

### 3. **Application Servers**
- Handle URL generation and validation
- Implement rate limiting
- Process analytics asynchronously

### 4. **Database Layer**
- Primary DB (PostgreSQL/MySQL) for mappings
  - Table: url_mappings (id, long_url, short_code, created_at, expires_at, user_id)
  - Table: analytics (id, short_code, accessed_at, ip, user_agent, referer)

- Cache Layer (Redis)
  - Cache frequently accessed URLs
  - LRU eviction policy
  - TTL based on access patterns

### 5. **URL Generation Strategies**

**Approach 1: Base62 Encoding**
\`\`\`
counter = get_next_sequence()
short_code = base62_encode(counter)
\`\`\`

**Approach 2: MD5 Hashing**
\`\`\`
hash = md5(long_url + salt)[:6]
\`\`\`

**Approach 3: Distributed ID Generator**
- Use Snowflake ID or similar
- Guarantees uniqueness across servers

### 6. **Scaling Considerations**
- Database sharding by short_code
- Read replicas for analytics queries
- CDN for static assets
- Message queue for async processing`,
            codeSnippet: `// Example API Implementation
class URLShortener {
  async createShortURL(longUrl: string, userId?: string) {
    // Rate limiting check
    await this.checkRateLimit(userId);
    
    // Generate unique code
    const shortCode = await this.generateUniqueCode();
    
    // Store in database
    await db.urlMappings.create({
      shortCode,
      longUrl,
      userId,
      createdAt: new Date()
    });
    
    // Cache the mapping
    await redis.setex(shortCode, 3600, longUrl);
    
    // Queue analytics job
    await queue.add('analytics', { shortCode, event: 'create' });
    
    return \`https://short.url/\${shortCode}\`;
  }
}`,
            timestamp: new Date(Date.now() - 86400000 * 3),
            likes: ['user-1', 'user-4', 'user-7', 'user-8'],
            dislikes: [],
            replies: [
              {
                id: 'r3_1',
                userId: 'user-5',
                userName: 'Anjali Patel',
                userAvatar: '👩‍💻',
                userRole: 'student',
                content: 'This is gold! Thank you so much. How would you handle custom short URLs?',
                timestamp: new Date(Date.now() - 86400000 * 2),
                likes: ['user-6'],
                dislikes: []
              },
              {
                id: 'r3_2',
                userId: 'user-6',
                userName: 'Vikram Singh',
                userAvatar: '👨‍💻',
                userRole: 'student',
                content: `For custom URLs:

1. **Validation**: Check if custom code is available
2. **Constraints**: 
   - Min length (3 chars)
   - Max length (16 chars)
   - Allowed characters (alphanumeric + - _)
3. **Reservation**: Users can reserve custom URLs
4. **Premium Feature**: Consider making it a paid feature

Additional validation:
- No profanity filter
- No reserved words (api, admin, etc.)
- Case insensitive uniqueness`,
                timestamp: new Date(Date.now() - 86400000),
                likes: ['user-5'],
                dislikes: []
              }
            ],
            isSolution: true,
            isPinned: false
          },
          {
            id: 'r4',
            userId: 'user-7',
            userName: 'Dr. Sharma',
            userAvatar: '👨‍🏫',
            userRole: 'teacher',
            userBadges: ['Expert', 'Mentor'],
            content: `Excellent discussion! Let me add some advanced topics:

## 1. **Database Sharding Strategy**

Shard by short_code first character:
- Shard 0: 0-3
- Shard 1: 4-7
- Shard 2: 8-b
- Shard 3: c-f
...

## 2. **Caching Strategy**

Multi-level caching:
- L1: Local memory cache (per server)
- L2: Redis cluster
- L3: Database

## 3. **Handling Redirects**

HTTP Status Codes:
- 301 (Permanent) - For SEO
- 302 (Temporary) - For analytics

## 4. **Analytics Pipeline**

\`\`\`
Redirect → Kafka → Stream Processing → 
  - Real-time analytics (Redis)
  - Batch processing (Spark)
  - Long-term storage (Hadoop)
\`\`\`

## 5. **Capacity Planning**

For 100M URLs:
- Storage: 100M * (100 bytes) ≈ 10GB
- Redirects: 1000/sec peak
- Bandwidth: ~1MB/sec

Great discussion! Anyone want to tackle rate limiting next?`,
            timestamp: new Date(Date.now() - 43200000),
            likes: ['user-1', 'user-5', 'user-6', 'user-8'],
            dislikes: [],
            isSolution: false,
            isPinned: true
          }
        ],
        likes: 67,
        dislikes: 2,
        tags: ['system-design', 'scalability', 'database', 'caching'],
        category: 'system-design',
        isPinned: true,
        isLocked: false,
        isSolved: true,
        isSticky: false,
        hasSolution: true,
        lastActivity: new Date(Date.now() - 3600000),
        contributors: ['user-6', 'user-7', 'user-8'],
        attachments: []
      },
      {
        id: '3',
        topic: 'JavaScript Closures: Understanding the Magic',
        content: `I've been learning JavaScript and closures are confusing me. Can someone explain:

1. What exactly is a closure?
2. How do they work under the hood?
3. Practical use cases
4. Common pitfalls

I've read the MDN docs but still struggling with practical implementation.`,
        codeSnippet: `function outer() {
  let count = 0;
  
  return function inner() {
    count++;
    console.log(count);
  }
}

const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3`,
        createdBy: 'user-8',
        creatorName: 'Neha Gupta',
        creatorAvatar: '👩‍🎓',
        creatorRole: 'student',
        createdAt: new Date(Date.now() - 86400000 * 3),
        views: 567,
        replies: [
          {
            id: 'r5',
            userId: 'user-9',
            userName: 'Rajesh Kumar',
            userAvatar: '👨‍💻',
            userRole: 'student',
            userBadges: ['JS Ninja'],
            content: `Great question! Let me explain closures in depth:

## What is a Closure?

A closure is a function that has access to its outer function's scope even after the outer function has returned.

## How it Works

When a function is defined in JavaScript, it carries its lexical environment with it. This includes:
- Local variables
- Outer function's variables
- Global variables

## Memory Management

The inner function maintains a reference to the outer variables, preventing garbage collection until the inner function itself is garbage collected.

## Common Use Cases

1. **Data Privacy**
\`\`\`javascript
const BankAccount = (initialBalance) => {
  let balance = initialBalance;
  
  return {
    deposit: (amount) => {
      balance += amount;
      return balance;
    },
    withdraw: (amount) => {
      if (amount <= balance) {
        balance -= amount;
        return balance;
      }
      return 'Insufficient funds';
    },
    getBalance: () => balance
  };
};
\`\`\`

2. **Function Factories**
\`\`\`javascript
const multiplyBy = (x) => (y) => x * y;
const double = multiplyBy(2);
const triple = multiplyBy(3);
\`\`\`

3. **Event Handlers**
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // 0,1,2,3,4 (with let)
  }, 1000);
}
\`\`\`

## Common Pitfalls

1. **Memory Leaks**
\`\`\`javascript
function heavyFunction() {
  const bigArray = new Array(1000000);
  return function() {
    console.log(bigArray.length);
  };
}
// bigArray never gets GC'd
\`\`\`

2. **Loop with var**
\`\`\`javascript
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // 5,5,5,5,5
  }, 1000);
}
\`\`\``,
            timestamp: new Date(Date.now() - 86400000 * 2),
            likes: ['user-1', 'user-3', 'user-5', 'user-8'],
            dislikes: [],
            replies: [
              {
                id: 'r5_1',
                userId: 'user-8',
                userName: 'Neha Gupta',
                userAvatar: '👩‍🎓',
                userRole: 'student',
                content: 'This is incredibly helpful! The BankAccount example really made it click. Thank you!',
                timestamp: new Date(Date.now() - 86400000),
                likes: ['user-9'],
                dislikes: []
              }
            ],
            isSolution: true,
            isPinned: false
          }
        ],
        likes: 34,
        dislikes: 1,
        tags: ['javascript', 'closures', 'beginner', 'web-dev'],
        category: 'web-dev',
        isPinned: false,
        isLocked: false,
        isSolved: true,
        isSticky: false,
        hasSolution: true,
        lastActivity: new Date(Date.now() - 86400000),
        contributors: ['user-9'],
        attachments: []
      }
    ]
    
    setDiscussions(sampleDiscussions)
    setTotalPages(Math.ceil(sampleDiscussions.length / itemsPerPage))
    setIsLoading(false)
  }

  const loadUserStats = () => {
    const stats: UserStats = {
      topicsCreated: 15,
      repliesGiven: 127,
      solutionsMarked: 23,
      likesReceived: 456,
      badges: ['Top Contributor', 'Helpful Helper', 'Quick Learner'],
      reputation: 2345,
      joinDate: new Date(Date.now() - 86400000 * 365),
      lastActive: new Date()
    }
    setUserStats(stats)
  }

  const handleCreateDiscussion = () => {
    if (!newDiscussion.topic || !newDiscussion.content) return
    
    setIsSubmitting(true)
    
    const discussion: Discussion = {
      id: `disc-${Date.now()}`,
      topic: newDiscussion.topic,
      content: newDiscussion.content,
      codeSnippet: newDiscussion.codeSnippet || undefined,
      createdBy: currentUser?.id || 'user',
      creatorName: currentUser?.name || 'User',
      creatorAvatar: currentUser?.avatar || '👤',
      creatorRole: currentUser?.role || 'student',
      creatorBadges: [],
      createdAt: new Date(),
      views: 0,
      replies: [],
      likes: 0,
      dislikes: 0,
      tags: newDiscussion.tags,
      category: newDiscussion.category,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      isSticky: false,
      hasSolution: false,
      lastActivity: new Date(),
      contributors: [currentUser?.id || 'user'],
      attachments: newDiscussion.attachments
    }
    
    setDiscussions([discussion, ...discussions])
    setShowCreateModal(false)
    setIsSubmitting(false)
    
    // Reset form
    setNewDiscussion({
      topic: '',
      content: '',
      category: 'general',
      tags: [],
      codeSnippet: '',
      attachments: []
    })
  }

  const handleAddReply = (discussionId: string, parentId?: string) => {
    if (!newReply.trim() && !replyCode.trim()) return
    
    setIsSubmitting(true)
    
    const reply: Reply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'User',
      userAvatar: currentUser?.avatar || '👤',
      userRole: currentUser?.role || 'student',
      userBadges: [],
      content: newReply,
      codeSnippet: replyCode || undefined,
      timestamp: new Date(),
      likes: [],
      dislikes: [],
      parentId: parentId,
      isEdited: false
    }
    
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        const updatedReplies = parentId 
          ? addNestedReply(d.replies, parentId, reply)
          : [...d.replies, reply]
        
        return {
          ...d,
          replies: updatedReplies,
          lastActivity: new Date(),
          contributors: [...new Set([...d.contributors, currentUser?.id || 'user'])]
        }
      }
      return d
    }))
    
    setNewReply('')
    setReplyCode('')
    setReplyTo(null)
    setShowCodeEditor(false)
    setIsSubmitting(false)
  }

  const addNestedReply = (replies: Reply[], parentId: string, newReply: Reply): Reply[] => {
    return replies.map(r => {
      if (r.id === parentId) {
        return {
          ...r,
          replies: [...(r.replies || []), newReply]
        }
      }
      if (r.replies) {
        return {
          ...r,
          replies: addNestedReply(r.replies, parentId, newReply)
        }
      }
      return r
    })
  }

  const handleLike = (discussionId: string, replyId?: string) => {
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        if (!replyId) {
          // Like the main discussion
          return {
            ...d,
            likes: d.likes + (d.likes.includes as any ? -1 : 1)
          }
        }
        
        // Like a reply
        return {
          ...d,
          replies: updateReplyLikes(d.replies, replyId, currentUser?.id || '')
        }
      }
      return d
    }))
  }

  const updateReplyLikes = (replies: Reply[], replyId: string, userId: string): Reply[] => {
    return replies.map(r => {
      if (r.id === replyId) {
        const hasLiked = r.likes.includes(userId)
        return {
          ...r,
          likes: hasLiked 
            ? r.likes.filter(id => id !== userId)
            : [...r.likes, userId]
        }
      }
      if (r.replies) {
        return {
          ...r,
          replies: updateReplyLikes(r.replies, replyId, userId)
        }
      }
      return r
    })
  }

  const handleMarkAsSolution = (discussionId: string, replyId: string) => {
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        return {
          ...d,
          replies: d.replies.map(r => ({
            ...r,
            isSolution: r.id === replyId
          })),
          hasSolution: true,
          isSolved: true
        }
      }
      return d
    }))
  }

  const handleVote = (discussionId: string, type: 'up' | 'down') => {
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        return {
          ...d,
          likes: type === 'up' ? d.likes + 1 : d.likes,
          dislikes: type === 'down' ? d.dislikes + 1 : d.dislikes
        }
      }
      return d
    }))
  }

  const handleReport = (discussionId: string, reason: string) => {
    console.log('Reporting discussion:', discussionId, reason)
    setShowReportModal(false)
    alert('Thank you for reporting. Our moderators will review this content.')
  }

  const handleShare = (discussionId: string) => {
    const url = `${window.location.origin}/discussion/${discussionId}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
    setShowShareModal(false)
  }

  const handleFollow = (discussionId: string) => {
    console.log('Following discussion:', discussionId)
    alert('You will now receive notifications for this discussion')
  }

  const handleBookmark = (discussionId: string) => {
    console.log('Bookmarking discussion:', discussionId)
    alert('Discussion bookmarked!')
  }

  const filteredDiscussions = discussions
    .filter(d => {
      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return d.topic.toLowerCase().includes(query) ||
               d.content.toLowerCase().includes(query) ||
               d.tags.some(tag => tag.includes(query))
      }
      
      // Time filter
      if (timeFilter !== 'all') {
        const now = Date.now()
        const day = 86400000
        const timeRanges = {
          today: now - day,
          week: now - day * 7,
          month: now - day * 30,
          year: now - day * 365
        }
        if (d.createdAt.getTime() < timeRanges[timeFilter]) return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return b.lastActivity.getTime() - a.lastActivity.getTime()
        case 'popular':
          return (b.likes + b.views) - (a.likes + a.views)
        case 'unanswered':
          return a.replies.length - b.replies.length
        case 'solved':
          return (b.hasSolution ? 1 : 0) - (a.hasSolution ? 1 : 0)
        default:
          return 0
      }
    })

  const paginatedDiscussions = filteredDiscussions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Render reply tree recursively
  const renderReplies = (replies: Reply[], depth: number = 0) => {
    return replies.map(reply => (
      <div key={reply.id} className={`reply-thread depth-${depth}`}>
        <div className={`reply-item ${reply.isSolution ? 'solution' : ''} ${reply.isPinned ? 'pinned' : ''}`}>
          <div className="reply-sidebar">
            <div className="reply-votes">
              <button className="vote-btn up" onClick={() => handleLike(selectedDiscussion?.id || '', reply.id)}>▲</button>
              <span className="vote-count">{reply.likes.length - reply.dislikes.length}</span>
              <button className="vote-btn down">▼</button>
            </div>
            {reply.isSolution && <span className="solution-badge">✓ Solution</span>}
          </div>
          
          <div className="reply-main">
            <div className="reply-header">
              <div className="user-info">
                <span className="user-avatar">{reply.userAvatar}</span>
                <span className="user-name">{reply.userName}</span>
                {reply.userRole === 'teacher' && <span className="role-badge teacher">Teacher</span>}
                {reply.userRole === 'admin' && <span className="role-badge admin">Admin</span>}
                {reply.userBadges?.map(badge => (
                  <span key={badge} className="user-badge">{badge}</span>
                ))}
              </div>
              <span className="reply-time">
                {formatTimeAgo(reply.timestamp)}
                {reply.isEdited && <span className="edited-indicator"> (edited)</span>}
              </span>
            </div>
            
            <div className="reply-content markdown">
              {reply.content.split('\n').map((line, i) => {
                if (line.startsWith('##')) {
                  return <h3 key={i}>{line.replace('##', '').trim()}</h3>
                }
                if (line.startsWith('###')) {
                  return <h4 key={i}>{line.replace('###', '').trim()}</h4>
                }
                if (line.match(/^\d\./)) {
                  return <li key={i}>{line}</li>
                }
                if (line.match(/^- /)) {
                  return <li key={i} className="bullet">{line.replace('- ', '')}</li>
                }
                return <p key={i}>{line}</p>
              })}
            </div>
            
            {reply.codeSnippet && (
              <div className="reply-code">
                <pre>
                  <code>{reply.codeSnippet}</code>
                </pre>
              </div>
            )}
            
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="reply-attachments">
                {reply.attachments.map(att => (
                  <div key={att.id} className="attachment-preview">
                    {att.type === 'image' && <img src={att.url} alt={att.name} />}
                    <span className="attachment-name">{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="reply-actions">
              <button 
                className={`action-btn like ${reply.likes.includes(currentUser?.id || '') ? 'active' : ''}`}
                onClick={() => handleLike(selectedDiscussion?.id || '', reply.id)}
              >
                👍 {reply.likes.length}
              </button>
              <button 
                className="action-btn reply"
                onClick={() => {
                  setReplyTo(reply.id)
                  setNewReply(`@${reply.userName} `)
                  editorRef.current?.focus()
                }}
              >
                ↩️ Reply
              </button>
              {currentUser?.role === 'teacher' && !selectedDiscussion?.hasSolution && (
                <button 
                  className="action-btn solution"
                  onClick={() => handleMarkAsSolution(selectedDiscussion?.id || '', reply.id)}
                >
                  ✓ Mark as Solution
                </button>
              )}
              <button className="action-btn share">🔗 Share</button>
              <button className="action-btn report">⚑ Report</button>
            </div>
          </div>
        </div>
        
        {reply.replies && reply.replies.length > 0 && (
          <div className="nested-replies">
            {renderReplies(reply.replies, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    
    return Math.floor(seconds) + ' seconds ago'
  }

  return (
    <div className="discussion-forum">
      {/* Header Section */}
      <div className="forum-header">
        <div className="header-left">
          <h1>Discussion Forum</h1>
          <div className="header-stats">
            <span className="stat">
              <span className="stat-value">{discussions.length}</span>
              <span className="stat-label">Topics</span>
            </span>
            <span className="stat">
              <span className="stat-value">
                {discussions.reduce((acc, d) => acc + d.replies.length, 0)}
              </span>
              <span className="stat-label">Replies</span>
            </span>
            <span className="stat">
              <span className="stat-value">
                {discussions.reduce((acc, d) => acc + d.contributors.length, 0)}
              </span>
              <span className="stat-label">Contributors</span>
            </span>
            <span className="stat">
              <span className="stat-value">{deviceInfo.nearbyDevices.length}</span>
              <span className="stat-label">Online</span>
            </span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span className="btn-icon">+</span>
            New Discussion
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="categories-bar">
        <button 
          className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Topics
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-name">{cat.name}</span>
            <span className="category-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
        
        <div className="filter-controls">
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
            <option value="solved">Solved</option>
          </select>
          
          <select 
            className="filter-select"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      {selectedDiscussion ? (
        // Discussion Detail View
        <div className="discussion-detail">
          {/* Navigation */}
          <div className="detail-nav">
            <button className="back-btn" onClick={() => setSelectedDiscussion(null)}>
              ← Back to Discussions
            </button>
            <div className="nav-actions">
              <button className="nav-btn" onClick={() => handleFollow(selectedDiscussion.id)}>
                🔔 Follow
              </button>
              <button className="nav-btn" onClick={() => handleBookmark(selectedDiscussion.id)}>
                🔖 Bookmark
              </button>
              <button className="nav-btn" onClick={() => setShowShareModal(true)}>
                🔗 Share
              </button>
              <button className="nav-btn" onClick={() => setShowReportModal(true)}>
                ⚑ Report
              </button>
            </div>
          </div>

          {/* Discussion Header */}
          <div className="discussion-header">
            <h2>{selectedDiscussion.topic}</h2>
            
            <div className="discussion-meta">
              <div className="meta-left">
                <div className="user-profile">
                  <span className="user-avatar large">{selectedDiscussion.creatorAvatar}</span>
                  <div className="user-details">
                    <span className="user-name">{selectedDiscussion.creatorName}</span>
                    {selectedDiscussion.creatorRole === 'teacher' && (
                      <span className="role-badge teacher">Teacher</span>
                    )}
                    <div className="user-stats">
                      <span>Reputation: {userStats?.reputation || 0}</span>
                      <span>•</span>
                      <span>Joined {formatTimeAgo(userStats?.joinDate || new Date())}</span>
                    </div>
                  </div>
                </div>
                
                <div className="discussion-stats">
                  <span className="stat">
                    <span className="stat-icon">👁️</span>
                    {selectedDiscussion.views} views
                  </span>
                  <span className="stat">
                    <span className="stat-icon">💬</span>
                    {selectedDiscussion.replies.length} replies
                  </span>
                  <span className="stat">
                    <span className="stat-icon">⭐</span>
                    {selectedDiscussion.likes} likes
                  </span>
                </div>
              </div>
              
              <div className="meta-right">
                <div className="tags">
                  {selectedDiscussion.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <span className="timestamp">Posted {formatTimeAgo(selectedDiscussion.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Discussion Content */}
          <div className="discussion-content">
            <div className="content-body markdown">
              {selectedDiscussion.content.split('\n').map((line, i) => {
                if (line.startsWith('#')) {
                  const level = line.match(/^#+/)[0].length
                  const text = line.replace(/^#+/, '').trim()
                  return React.createElement(`h${level}`, { key: i }, text)
                }
                if (line.match(/^\d\./)) {
                  return <li key={i} className="numbered">{line}</li>
                }
                if (line.match(/^- /)) {
                  return <li key={i} className="bullet">{line.replace('- ', '')}</li>
                }
                if (line.startsWith('```')) {
                  // Handle code blocks
                  return null
                }
                return <p key={i}>{line}</p>
              })}
            </div>
            
            {selectedDiscussion.codeSnippet && (
              <div className="content-code">
                <pre>
                  <code>{selectedDiscussion.codeSnippet}</code>
                </pre>
              </div>
            )}
            
            {selectedDiscussion.attachments && selectedDiscussion.attachments.length > 0 && (
              <div className="content-attachments">
                <h4>Attachments</h4>
                <div className="attachment-grid">
                  {selectedDiscussion.attachments.map(att => (
                    <div key={att.id} className="attachment-card">
                      {att.type === 'image' && <img src={att.url} alt={att.name} />}
                      <span className="attachment-name">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="content-actions">
              <button 
                className={`action-btn large like ${selectedDiscussion.likes > 0 ? 'active' : ''}`}
                onClick={() => handleVote(selectedDiscussion.id, 'up')}
              >
                👍 {selectedDiscussion.likes}
              </button>
              <button 
                className="action-btn large dislike"
                onClick={() => handleVote(selectedDiscussion.id, 'down')}
              >
                👎 {selectedDiscussion.dislikes}
              </button>
            </div>
          </div>

          {/* Contributors */}
          {selectedDiscussion.contributors.length > 0 && (
            <div className="contributors-section">
              <h4>Contributors</h4>
              <div className="contributors-list">
                {selectedDiscussion.contributors.map(contributorId => {
                  const contributor = discussions
                    .flatMap(d => d.replies)
                    .find(r => r.userId === contributorId)
                  return contributor ? (
                    <div key={contributorId} className="contributor-chip">
                      <span className="contributor-avatar">{contributor.userAvatar}</span>
                      <span className="contributor-name">{contributor.userName}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Replies Section */}
          <div className="replies-section">
            <div className="replies-header">
              <h3>{selectedDiscussion.replies.length} Replies</h3>
              <div className="replies-sort">
                <select defaultValue="top">
                  <option value="top">Top Votes</option>
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            {renderReplies(selectedDiscussion.replies)}

            {/* Add Reply Form */}
            <div className="add-reply-form">
              <h4>Add your reply</h4>
              
              {replyTo && (
                <div className="reply-indicator">
                  Replying to: @{discussions
                    .flatMap(d => d.replies)
                    .find(r => r.id === replyTo)?.userName}
                  <button className="cancel-reply" onClick={() => setReplyTo(null)}>×</button>
                </div>
              )}
              
              <textarea
                ref={editorRef}
                className="reply-textarea"
                placeholder="Write your reply... (Markdown supported)"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={6}
              />
              
              {showCodeEditor && (
                <div className="code-editor">
                  <textarea
                    className="code-input"
                    placeholder="Paste your code here..."
                    value={replyCode}
                    onChange={(e) => setReplyCode(e.target.value)}
                    rows={8}
                  />
                </div>
              )}
              
              <div className="reply-toolbar">
                <button 
                  className={`toolbar-btn ${showCodeEditor ? 'active' : ''}`}
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                >
                  &lt;/&gt; Code
                </button>
                <button className="toolbar-btn">📎 Attach</button>
                <button className="toolbar-btn">🔗 Link</button>
                <button className="toolbar-btn">🖼️ Image</button>
                <div className="toolbar-right">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleAddReply(selectedDiscussion.id, replyTo || undefined)}
                    disabled={isSubmitting || (!newReply.trim() && !replyCode.trim())}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Discussions List View
        <div className="discussions-view">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading discussions...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
              <button className="btn btn-primary" onClick={loadDiscussions}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className={`discussions-grid ${view}`}>
                {paginatedDiscussions.map(discussion => (
                  <div 
                    key={discussion.id} 
                    className={`discussion-card ${discussion.isPinned ? 'pinned' : ''} ${discussion.isSolved ? 'solved' : ''}`}
                    onClick={() => setSelectedDiscussion(discussion)}
                  >
                    <div className="card-header">
                      <div className="header-left">
                        {discussion.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                        {discussion.isSolved && <span className="solved-badge">✓ Solved</span>}
                        {discussion.isLocked && <span className="locked-badge">🔒 Locked</span>}
                      </div>
                      <span className="category-badge">{discussion.category}</span>
                    </div>
                    
                    <h3 className="card-title">{discussion.topic}</h3>
                    
                    <p className="card-excerpt">
                      {discussion.content.substring(0, 150)}...
                    </p>
                    
                    <div className="card-tags">
                      {discussion.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                      {discussion.tags.length > 3 && (
                        <span className="tag-more">+{discussion.tags.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <div className="footer-left">
                        <span className="author-avatar">{discussion.creatorAvatar}</span>
                        <span className="author-name">{discussion.creatorName}</span>
                      </div>
                      <div className="footer-stats">
                        <span className="stat" title="Views">👁️ {discussion.views}</span>
                        <span className="stat" title="Replies">💬 {discussion.replies.length}</span>
                        <span className="stat" title="Likes">👍 {discussion.likes}</span>
                        <span className="time">{formatTimeAgo(discussion.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="page-ellipsis">...</span>
                        )}
                        <button 
                          className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  
                  <button 
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h2>Create New Discussion</h2>
            
            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                value={newDiscussion.topic}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, topic: e.target.value })}
                placeholder="Enter a descriptive topic"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newDiscussion.category}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                placeholder="Describe your topic in detail... (Markdown supported)"
                rows={8}
              />
            </div>

            <div className="form-group">
              <label>Code Snippet (Optional)</label>
              <textarea
                value={newDiscussion.codeSnippet}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, codeSnippet: e.target.value })}
                placeholder="Paste any relevant code here..."
                rows={6}
                className="code-textarea"
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      setNewDiscussion({
                        ...newDiscussion,
                        tags: [...newDiscussion.tags, tagInput.trim().toLowerCase()]
                      })
                      setTagInput('')
                    }
                  }}
                  placeholder="Press Enter to add tags"
                />
              </div>
              <div className="tag-list">
                {newDiscussion.tags.map(tag => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button onClick={() => setNewDiscussion({
                      ...newDiscussion,
                      tags: newDiscussion.tags.filter(t => t !== tag)
                    })}>×</button>
                  </span>
                ))}
              </div>
              <small className="helper-text">Common tags: algorithms, javascript, help, question</small>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateDiscussion}
                disabled={!newDiscussion.topic || !newDiscussion.content || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Discussion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Report Discussion</h2>
            
            <div className="report-options">
              <label className="radio-option">
                <input type="radio" name="report" value="spam" />
                <span>Spam</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="report" value="harassment" />
                <span>Harassment</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="report" value="inappropriate" />
                <span>Inappropriate Content</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="report" value="other" />
                <span>Other</span>
              </label>
            </div>

            <textarea 
              className="report-details"
              placeholder="Provide additional details..."
              rows={4}
            />

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => handleReport(selectedDiscussion?.id || '', '')}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDiscussion && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <h2>Share Discussion</h2>
            
            <div className="share-options">
              <div className="share-link">
                <input 
                  type="text" 
                  value={`${window.location.origin}/discussion/${selectedDiscussion.id}`}
                  readOnly
                />
                <button className="btn btn-primary" onClick={() => handleShare(selectedDiscussion.id)}>
                  Copy Link
                </button>
              </div>
              
              <div className="share-platforms">
                <button className="platform-btn twitter">Twitter</button>
                <button className="platform-btn linkedin">LinkedIn</button>
                <button className="platform-btn facebook">Facebook</button>
                <button className="platform-btn email">Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .discussion-forum {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        /* Header Styles */
        .forum-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .forum-header h1 {
          font-size: 2rem;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e3a5f;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #999999;
        }

        /* Categories Bar */
        .categories-bar {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 1rem 0;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #2a2a2a;
        }

        .category-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          color: #cccccc;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .category-chip:hover {
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .category-chip.active {
          background: #1e3a5f;
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .category-icon {
          font-size: 1rem;
        }

        .category-count {
          font-size: 0.7rem;
          color: #999999;
        }

        .category-chip.active .category-count {
          color: #cccccc;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 0 1rem;
          position: relative;
        }

        .search-icon {
          color: #ffffff;
          margin-right: 0.5rem;
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          padding: 0.8rem 0;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .search-box input:focus {
          outline: none;
        }

        .clear-search {
          background: none;
          border: none;
          color: #999999;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 0.5rem;
        }

        .filter-controls {
          display: flex;
          gap: 0.5rem;
        }

        .filter-select {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #ffffff;
          padding: 0.5rem 2rem 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
        }

        .filter-toggle {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #cccccc;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .filter-toggle.active {
          background: #1e3a5f;
          border-color: #1e3a5f;
          color: #ffffff;
        }

        /* Discussions Grid */
        .discussions-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .discussions-grid.list {
          grid-template-columns: 1fr;
        }

        .discussions-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .discussion-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .discussion-card:hover {
          border-color: #1e3a5f;
          transform: translateY(-2px);
        }

        .discussion-card.pinned {
          border-left: 4px solid #1e3a5f;
        }

        .discussion-card.solved {
          border-right: 4px solid #4caf50;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .pinned-badge,
        .solved-badge,
        .locked-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .pinned-badge {
          background: #1e3a5f;
          color: #ffffff;
        }

        .solved-badge {
          background: #4caf50;
          color: #ffffff;
        }

        .locked-badge {
          background: #ff4444;
          color: #ffffff;
        }

        .category-badge {
          font-size: 0.7rem;
          color: #999999;
          background: #2a2a2a;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .card-title {
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .card-excerpt {
          font-size: 0.9rem;
          color: #cccccc;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .card-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .tag {
          background: #2a2a2a;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #cccccc;
        }

        .tag-more {
          font-size: 0.7rem;
          color: #999999;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #2a2a2a;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .author-avatar {
          font-size: 1.2rem;
        }

        .author-name {
          font-size: 0.85rem;
          color: #ffffff;
        }

        .footer-stats {
          display: flex;
          gap: 0.75rem;
          color: #999999;
          font-size: 0.8rem;
        }

        .footer-stats .stat {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .time {
          color: #666666;
        }

        /* Discussion Detail View */
        .discussion-detail {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 2rem;
        }

        .detail-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #2a2a2a;
        }

        .back-btn {
          background: none;
          border: none;
          color: #1e3a5f;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        .back-btn:hover {
          background: #0a0a0a;
        }

        .nav-actions {
          display: flex;
          gap: 0.5rem;
        }

        .nav-btn {
          background: none;
          border: 1px solid #2a2a2a;
          color: #cccccc;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .discussion-header {
          margin-bottom: 2rem;
        }

        .discussion-header h2 {
          font-size: 1.8rem;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .discussion-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .user-profile {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .user-avatar.large {
          font-size: 3rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .user-name {
          font-size: 1.1rem;
          font-weight: bold;
          color: #ffffff;
        }

        .user-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #999999;
        }

        .discussion-stats {
          display: flex;
          gap: 1.5rem;
        }

        .discussion-stats .stat {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #999999;
          font-size: 0.9rem;
        }

        .meta-right {
          text-align: right;
        }

        .timestamp {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666666;
        }

        .discussion-content {
          background: #0a0a0a;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .content-body {
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .content-body h1 {
          font-size: 1.8rem;
          margin: 1.5rem 0 1rem;
        }

        .content-body h2 {
          font-size: 1.5rem;
          margin: 1.2rem 0 0.8rem;
        }

        .content-body h3 {
          font-size: 1.2rem;
          margin: 1rem 0 0.5rem;
        }

        .content-body p {
          margin: 1rem 0;
        }

        .content-body li {
          margin: 0.5rem 0 0.5rem 1.5rem;
        }

        .content-body li.numbered {
          list-style-type: decimal;
        }

        .content-body li.bullet {
          list-style-type: disc;
        }

        .content-code {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .content-code pre {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
        }

        .content-attachments {
          margin: 1.5rem 0;
        }

        .content-attachments h4 {
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .attachment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .attachment-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 0.5rem;
          text-align: center;
        }

        .attachment-card img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .content-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .action-btn.large {
          padding: 0.8rem 2rem;
          font-size: 1rem;
        }

        /* Contributors Section */
        .contributors-section {
          margin: 2rem 0;
        }

        .contributors-section h4 {
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .contributors-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .contributor-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 0.3rem 1rem;
        }

        .contributor-avatar {
          font-size: 1rem;
        }

        .contributor-name {
          font-size: 0.85rem;
          color: #ffffff;
        }

        /* Replies Section */
        .replies-section {
          margin-top: 2rem;
        }

        .replies-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .replies-header h3 {
          font-size: 1.2rem;
          color: #ffffff;
        }

        .replies-sort select {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #ffffff;
          padding: 0.4rem 2rem 0.4rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .reply-thread {
          margin-bottom: 1rem;
        }

        .reply-thread.depth-1 { margin-left: 3rem; }
        .reply-thread.depth-2 { margin-left: 6rem; }
        .reply-thread.depth-3 { margin-left: 9rem; }

        .reply-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .reply-item.solution {
          border-left: 4px solid #4caf50;
          background: #0a1f0a;
        }

        .reply-item.pinned {
          border-left: 4px solid #1e3a5f;
        }

        .reply-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 60px;
        }

        .reply-votes {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .vote-btn {
          background: none;
          border: none;
          color: #999999;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.2rem;
        }

        .vote-btn:hover {
          color: #1e3a5f;
        }

        .vote-count {
          font-size: 1rem;
          font-weight: bold;
          color: #ffffff;
        }

        .solution-badge {
          background: #4caf50;
          color: #ffffff;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .reply-main {
          flex: 1;
        }

        .reply-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .user-avatar {
          font-size: 1.5rem;
        }

        .user-name {
          font-weight: bold;
          color: #ffffff;
        }

        .role-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .role-badge.teacher {
          background: #1e3a5f;
          color: #ffffff;
        }

        .role-badge.admin {
          background: #ff4444;
          color: #ffffff;
        }

        .user-badge {
          background: #2a2a2a;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #cccccc;
        }

        .reply-time {
          font-size: 0.8rem;
          color: #999999;
        }

        .edited-indicator {
          font-style: italic;
          color: #666666;
        }

        .reply-content {
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .reply-content h3 {
          margin: 1rem 0 0.5rem;
          color: #ffffff;
        }

        .reply-content h4 {
          margin: 0.8rem 0 0.4rem;
          color: #cccccc;
        }

        .reply-code {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .reply-code pre {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
        }

        .reply-attachments {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
        }

        .attachment-preview {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 0.5rem;
        }

        .attachment-preview img {
          max-width: 100px;
          max-height: 100px;
          border-radius: 4px;
        }

        .reply-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #999999;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #2a2a2a;
          color: #ffffff;
        }

        .action-btn.like.active {
          color: #ff4444;
        }

        .action-btn.solution {
          color: #4caf50;
        }

        .nested-replies {
          margin-left: 2rem;
        }

        /* Add Reply Form */
        .add-reply-form {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
        }

        .add-reply-form h4 {
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .reply-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e3a5f;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .cancel-reply {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .reply-textarea {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          padding: 1rem;
          margin-bottom: 1rem;
          resize: vertical;
          font-family: inherit;
        }

        .code-editor {
          margin-bottom: 1rem;
        }

        .code-input {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          padding: 1rem;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          resize: vertical;
        }

        .reply-toolbar {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .toolbar-btn {
          background: none;
          border: 1px solid #2a2a2a;
          color: #cccccc;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-btn:hover {
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .toolbar-btn.active {
          background: #1e3a5f;
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .toolbar-right {
          margin-left: auto;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .page-btn {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #cccccc;
          width: 36px;
          height: 36px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .page-btn.active {
          background: #1e3a5f;
          border-color: #1e3a5f;
          color: #ffffff;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-ellipsis {
          color: #999999;
          padding: 0 0.5rem;
        }

        /* Loading & Error States */
        .loading-state,
        .error-state {
          text-align: center;
          padding: 3rem;
          color: #999999;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #2a2a2a;
          border-top-color: #1e3a5f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
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
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content.large {
          max-width: 800px;
        }

        .modal-content.small {
          max-width: 400px;
        }

        .modal-content h2 {
          margin-bottom: 1.5rem;
          color: #ffffff;
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

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.8rem;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1e3a5f;
        }

        .code-textarea {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
        }

        .tag-input-container {
          margin-bottom: 0.5rem;
        }

        .helper-text {
          display: block;
          margin-top: 0.5rem;
          color: #666666;
          font-size: 0.8rem;
        }

        .report-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cccccc;
          cursor: pointer;
        }

        .report-details {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          padding: 0.8rem;
          margin: 1rem 0;
          resize: vertical;
        }

        .share-link {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .share-link input {
          flex: 1;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #ffffff;
          padding: 0.6rem;
        }

        .share-platforms {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .platform-btn {
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          color: #ffffff;
          padding: 0.6rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .platform-btn:hover {
          border-color: #1e3a5f;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1e3a5f;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .forum-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .filters-bar {
            flex-direction: column;
          }

          .filter-controls {
            flex-wrap: wrap;
          }

          .discussion-meta {
            flex-direction: column;
            gap: 1rem;
          }

          .reply-thread.depth-1 { margin-left: 1rem; }
          .reply-thread.depth-2 { margin-left: 2rem; }
          .reply-thread.depth-3 { margin-left: 3rem; }

          .reply-item {
            flex-direction: column;
          }

          .reply-sidebar {
            flex-direction: row;
            justify-content: flex-start;
          }

          .reply-actions {
            flex-wrap: wrap;
          }

          .reply-toolbar {
            flex-wrap: wrap;
          }

          .toolbar-right {
            margin-left: 0;
            width: 100%;
          }

          .toolbar-right .btn {
            width: 100%;
          }

          .pagination {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}