/**
 * Security tests for retrieval API endpoints
 * Tests the ownership verification added to fix IDOR vulnerability
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock modules
jest.mock('@/lib/server/server-chat-helpers')
jest.mock('@supabase/supabase-js')

import { getServerProfile } from '@/lib/server/server-chat-helpers'
import { createClient } from '@supabase/supabase-js'
import { POST as retrievePost } from '@/app/api/retrieval/retrieve/route'

const mockGetServerProfile = getServerProfile as jest.MockedFunction<typeof getServerProfile>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Retrieval API Security', () => {
  let mockSupabaseClient: any
  
  beforeEach(() => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn()
    }
    mockCreateClient.mockReturnValue(mockSupabaseClient as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('retrieve/route.ts', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerProfile.mockRejectedValue(new Error('User not found'))

      const request = new Request('http://localhost/api/retrieval/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          userInput: 'test',
          fileIds: ['file-123'],
          embeddingsProvider: 'local',
          sourceCount: 5
        })
      })

      const response = await retrievePost(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 400 for empty fileIds array', async () => {
      mockGetServerProfile.mockResolvedValue({
        user_id: 'user-123'
      } as any)

      const request = new Request('http://localhost/api/retrieval/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          userInput: 'test',
          fileIds: [],
          embeddingsProvider: 'local',
          sourceCount: 5
        })
      })

      const response = await retrievePost(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('fileIds must be a non-empty array')
    })

    it('should return 403 when user does not own files', async () => {
      mockGetServerProfile.mockResolvedValue({
        user_id: 'user-123'
      } as any)

      mockSupabaseClient.in.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new Request('http://localhost/api/retrieval/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          userInput: 'test',
          fileIds: ['foreign-file-123'],
          embeddingsProvider: 'local',
          sourceCount: 5
        })
      })

      const response = await retrievePost(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toContain('Forbidden')
    })

    it('should allow access to owned files', async () => {
      mockGetServerProfile.mockResolvedValue({
        user_id: 'user-123'
      } as any)

      mockSupabaseClient.in.mockResolvedValue({
        data: [{ id: 'file-123' }],
        error: null
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: [{ content: 'test', similarity: 0.9 }],
        error: null
      })

      const request = new Request('http://localhost/api/retrieval/retrieve', {
        method: 'POST',
        body: JSON.stringify({
          userInput: 'test',
          fileIds: ['file-123'],
          embeddingsProvider: 'local',
          sourceCount: 5
        })
      })

      const response = await retrievePost(request)

      expect(response.status).toBe(200)
    })
  })
})
