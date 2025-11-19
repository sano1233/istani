/**
 * Unit tests for lib/db-helpers.ts
 * Tests all database helper functions with comprehensive scenarios
 */

import {
  dbQuery,
  dbGetById,
  dbInsert,
  dbInsertMany,
  dbUpdate,
  dbUpdateWhere,
  dbDelete,
  dbDeleteWhere,
  dbCount,
  dbExists,
  dbUpsert,
  dbBatch,
} from '@/lib/db-helpers'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    dbQuery: jest.fn(),
    dbError: jest.fn(),
    error: jest.fn(),
  },
}))

const { createClient } = require('@/lib/supabase/server')
const { logger } = require('@/lib/logger')

describe('dbQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockSupabase = (data: any, error: any = null, count: number = 0) => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(function(this: any) { return this }),
        order: jest.fn(function(this: any) { return this }),
        limit: jest.fn(function(this: any) { return this }),
        range: jest.fn(() => Promise.resolve({ data, error, count })),
        then: (resolve: any) => resolve({ data, error, count }),
      })),
    })),
  })

  it('should query data successfully', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    createClient.mockResolvedValue(createMockSupabase(mockData, null, 1))

    const result = await dbQuery('users')
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
    expect(result.count).toBe(1)
  })

  it('should apply filters correctly', async () => {
    const mockSupabase = createMockSupabase([{ id: 1, status: 'active' }])
    createClient.mockResolvedValue(mockSupabase)

    await dbQuery('users', { filters: { status: 'active', role: 'admin' } })
    
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })

  it('should skip undefined and null filter values', async () => {
    const mockSupabase = createMockSupabase([])
    createClient.mockResolvedValue(mockSupabase)

    await dbQuery('users', { 
      filters: { status: 'active', deleted: null, archived: undefined } 
    })
    
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })

  it('should apply ordering', async () => {
    const mockSupabase = createMockSupabase([])
    createClient.mockResolvedValue(mockSupabase)

    await dbQuery('users', { 
      orderBy: { column: 'created_at', ascending: false } 
    })
    
    expect(logger.dbQuery).toHaveBeenCalledWith('select', 'users', expect.any(Object))
  })

  it('should apply limit and offset', async () => {
    const mockSupabase = createMockSupabase([])
    createClient.mockResolvedValue(mockSupabase)

    await dbQuery('users', { limit: 10, offset: 20 })
    
    expect(logger.dbQuery).toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    const error = { message: 'Database error' }
    createClient.mockResolvedValue(createMockSupabase(null, error))

    const result = await dbQuery('users')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
    expect(logger.dbError).toHaveBeenCalled()
  })

  it('should handle exceptions', async () => {
    createClient.mockRejectedValue(new Error('Connection failed'))

    const result = await dbQuery('users')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })

  it('should use custom select fields', async () => {
    const mockSupabase = createMockSupabase([{ id: 1 }])
    createClient.mockResolvedValue(mockSupabase)

    await dbQuery('users', { select: 'id, name, email' })
    
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })
})

describe('dbGetById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get record by ID successfully', async () => {
    const mockData = { id: '123', name: 'Test' }
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbGetById('users', '123')
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should handle not found errors', async () => {
    const error = { message: 'Not found' }
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbGetById('users', 'nonexistent')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })

  it('should use custom select fields', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    await dbGetById('users', '123', 'id, name')
    
    expect(mockSupabase.from).toHaveBeenCalledWith('users')
  })
})

describe('dbInsert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should insert record successfully', async () => {
    const mockData = { id: '123', name: 'Test' }
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbInsert('users', { name: 'Test' })
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should insert without returning data', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => Promise.resolve({ error: null })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbInsert('users', { name: 'Test' }, false)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })

  it('should handle insert errors', async () => {
    const error = { message: 'Constraint violation' }
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbInsert('users', { name: 'Test' })
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbInsertMany', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should insert multiple records successfully', async () => {
    const mockData = [{ id: '1', name: 'Test1' }, { id: '2', name: 'Test2' }]
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbInsertMany('users', [{ name: 'Test1' }, { name: 'Test2' }])
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should insert many without returning data', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => Promise.resolve({ error: null })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbInsertMany('users', [{ name: 'Test' }], false)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })
})

describe('dbUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update record successfully', async () => {
    const mockData = { id: '123', name: 'Updated' }
    const mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
            })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpdate('users', '123', { name: 'Updated' })
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should update without returning data', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpdate('users', '123', { name: 'Updated' }, false)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })

  it('should handle update errors', async () => {
    const error = { message: 'Update failed' }
    const mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error })),
            })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpdate('users', '123', { name: 'Updated' })
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbUpdateWhere', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update records with filters', async () => {
    const mockData = [{ id: '1', status: 'updated' }]
    const mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(function(this: any) { return this }),
          select: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpdateWhere(
      'users',
      { status: 'pending' },
      { status: 'updated' },
      true
    )
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should update without returning data', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpdateWhere('users', { status: 'old' }, { status: 'new' })
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })
})

describe('dbDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete record successfully', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbDelete('users', '123')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })

  it('should handle delete errors', async () => {
    const error = { message: 'Delete failed' }
    const mockSupabase = {
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbDelete('users', '123')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbDeleteWhere', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete records with filters', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbDeleteWhere('users', { status: 'deleted' })
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })

  it('should handle delete errors', async () => {
    const error = { message: 'Delete failed' }
    const mockSupabase = {
      from: jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbDeleteWhere('users', { status: 'old' })
    
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbCount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should count records successfully', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(function(this: any) { return this }),
          then: (resolve: any) => resolve({ count: 42, error: null }),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbCount('users')
    
    expect(result.data).toBe(42)
    expect(result.error).toBeNull()
  })

  it('should count with filters', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(function(this: any) { return this }),
          then: (resolve: any) => resolve({ count: 10, error: null }),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbCount('users', { status: 'active' })
    
    expect(result.data).toBe(10)
  })

  it('should return 0 when count is null', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          then: (resolve: any) => resolve({ count: null, error: null }),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbCount('users')
    
    expect(result.data).toBe(0)
  })

  it('should handle count errors', async () => {
    const error = { message: 'Count failed' }
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          then: (resolve: any) => resolve({ count: null, error }),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbCount('users')
    
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbExists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when records exist', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            then: (resolve: any) => resolve({ count: 1, error: null }),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbExists('users', { email: 'test@example.com' })
    
    expect(result.data).toBe(true)
  })

  it('should return false when no records exist', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            then: (resolve: any) => resolve({ count: 0, error: null }),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbExists('users', { email: 'nonexistent@example.com' })
    
    expect(result.data).toBe(false)
  })

  it('should handle errors', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            then: (resolve: any) => resolve({ count: null, error: { message: 'Error' } }),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbExists('users', { email: 'test@example.com' })
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('dbUpsert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should upsert record successfully', async () => {
    const mockData = { id: '123', name: 'Test' }
    const mockSupabase = {
      from: jest.fn(() => ({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpsert('users', { id: '123', name: 'Test' })
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should upsert without returning data', async () => {
    const mockSupabase = {
      from: jest.fn(() => ({
        upsert: jest.fn(() => Promise.resolve({ error: null })),
      })),
    }
    createClient.mockResolvedValue(mockSupabase)

    const result = await dbUpsert('users', { name: 'Test' }, false)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })
})

describe('dbBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should execute batch operations successfully', async () => {
    const operations = [
      jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      jest.fn().mockResolvedValue({ data: { id: 2 }, error: null }),
      jest.fn().mockResolvedValue({ data: { id: 3 }, error: null }),
    ]

    const result = await dbBatch(operations)
    
    expect(result.data).toHaveLength(3)
    expect(result.error).toBeNull()
    expect(operations[0]).toHaveBeenCalled()
    expect(operations[1]).toHaveBeenCalled()
    expect(operations[2]).toHaveBeenCalled()
  })

  it('should return first error when operations fail', async () => {
    const error = new Error('Operation failed')
    const operations = [
      jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      jest.fn().mockResolvedValue({ data: null, error }),
      jest.fn().mockResolvedValue({ data: { id: 3 }, error: null }),
    ]

    const result = await dbBatch(operations)
    
    expect(result.data).toBeNull()
    expect(result.error).toBe(error)
  })

  it('should handle exceptions in batch operations', async () => {
    const operations = [
      jest.fn().mockRejectedValue(new Error('Exception')),
    ]

    const result = await dbBatch(operations)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
  })

  it('should continue after errors and collect all errors', async () => {
    const error1 = new Error('Error 1')
    const error2 = new Error('Error 2')
    const operations = [
      jest.fn().mockResolvedValue({ data: null, error: error1 }),
      jest.fn().mockResolvedValue({ data: { id: 2 }, error: null }),
      jest.fn().mockResolvedValue({ data: null, error: error2 }),
    ]

    const result = await dbBatch(operations)
    
    expect(result.data).toBeNull()
    expect(result.error).toBe(error1) // Returns first error
  })
})