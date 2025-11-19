import { describe, it, expect, vi, beforeEach } from 'vitest';
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
} from '../db-helpers';

// Mock dependencies
vi.mock('../supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../logger', () => ({
  logger: {
    dbQuery: vi.fn(),
    dbError: vi.fn(),
    error: vi.fn(),
  },
}));

describe('dbQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should query with default options', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: mockData, error: null, count: 1 }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbQuery('users');
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
    expect(result.count).toBe(1);
  });

  it('should apply filters', async () => {
    const { createClient } = await import('../supabase/server');
    const eqSpy = vi.fn().mockReturnThis();
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: eqSpy,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbQuery('users', { filters: { email: 'test@example.com', status: 'active' } });
    expect(eqSpy).toHaveBeenCalledWith('email', 'test@example.com');
    expect(eqSpy).toHaveBeenCalledWith('status', 'active');
  });

  it('should skip null and undefined filters', async () => {
    const { createClient } = await import('../supabase/server');
    const eqSpy = vi.fn().mockReturnThis();
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: eqSpy,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbQuery('users', { filters: { email: null, status: undefined, name: 'John' } });
    expect(eqSpy).toHaveBeenCalledTimes(1);
    expect(eqSpy).toHaveBeenCalledWith('name', 'John');
  });

  it('should apply ordering', async () => {
    const { createClient } = await import('../supabase/server');
    const orderSpy = vi.fn().mockReturnThis();
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: orderSpy,
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbQuery('users', { orderBy: { column: 'created_at', ascending: false } });
    expect(orderSpy).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('should apply pagination', async () => {
    const { createClient } = await import('../supabase/server');
    const rangeSpy = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: rangeSpy,
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbQuery('users', { limit: 10, offset: 20 });
    expect(rangeSpy).toHaveBeenCalledWith(20, 29);
  });

  it('should handle database errors', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: 0,
      }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbQuery('users');
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('Database error');
  });
});

describe('dbGetById', () => {
  it('should get record by ID', async () => {
    const mockData = { id: '123', name: 'Test' };
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbGetById('users', '123');
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should handle custom select', async () => {
    const { createClient } = await import('../supabase/server');
    const selectSpy = vi.fn().mockReturnThis();
    const mockQuery = {
      select: selectSpy,
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbGetById('users', '123', 'id,name,email');
    expect(selectSpy).toHaveBeenCalledWith('id,name,email');
  });

  it('should handle errors', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbGetById('users', '999');
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Not found');
  });
});

describe('dbInsert', () => {
  it('should insert and return data by default', async () => {
    const insertData = { name: 'Test', email: 'test@example.com' };
    const returnedData = { id: '123', ...insertData };
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnedData, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbInsert('users', insertData);
    expect(result.data).toEqual(returnedData);
    expect(result.error).toBeNull();
  });

  it('should insert without returning data when specified', async () => {
    const insertData = { name: 'Test' };
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbInsert('users', insertData, false);
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });
});

describe('dbUpdate', () => {
  it('should update record by ID', async () => {
    const updateData = { name: 'Updated' };
    const returnedData = { id: '123', name: 'Updated' };
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnedData, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbUpdate('users', '123', updateData);
    expect(result.data).toEqual(returnedData);
    expect(result.error).toBeNull();
  });
});

describe('dbDelete', () => {
  it('should delete record by ID', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbDelete('users', '123');
    expect(result.error).toBeNull();
  });
});

describe('dbCount', () => {
  it('should count records', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 42, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbCount('users');
    expect(result.data).toBe(42);
    expect(result.error).toBeNull();
  });

  it('should count with filters', async () => {
    const { createClient } = await import('../supabase/server');
    const eqSpy = vi.fn().mockResolvedValue({ count: 5, error: null });
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: eqSpy,
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    await dbCount('users', { status: 'active' });
    expect(eqSpy).toHaveBeenCalledWith('status', 'active');
  });
});

describe('dbExists', () => {
  it('should return true when record exists', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbExists('users', { email: 'test@example.com' });
    expect(result.data).toBe(true);
  });

  it('should return false when record does not exist', async () => {
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbExists('users', { email: 'nonexistent@example.com' });
    expect(result.data).toBe(false);
  });
});

describe('dbUpsert', () => {
  it('should upsert record', async () => {
    const data = { id: '123', name: 'Test' };
    const { createClient } = await import('../supabase/server');
    const mockQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data, error: null }),
    };
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await dbUpsert('users', data);
    expect(result.data).toEqual(data);
    expect(result.error).toBeNull();
  });
});

describe('dbBatch', () => {
  it('should execute multiple operations', async () => {
    const operations = [
      () => Promise.resolve({ data: { id: 1 }, error: null }),
      () => Promise.resolve({ data: { id: 2 }, error: null }),
      () => Promise.resolve({ data: { id: 3 }, error: null }),
    ];

    const result = await dbBatch(operations);
    expect(result.data).toHaveLength(3);
    expect(result.error).toBeNull();
  });

  it('should handle errors in batch operations', async () => {
    const operations = [
      () => Promise.resolve({ data: { id: 1 }, error: null }),
      () => Promise.resolve({ data: null, error: new Error('Failed') }),
      () => Promise.resolve({ data: { id: 3 }, error: null }),
    ];

    const result = await dbBatch(operations);
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
  });
});
